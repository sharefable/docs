import { Context } from "probot";
import { execSync } from "child_process";
import * as path from "path";
import { rm, readFile } from "fs/promises";
import { getOrCreateTempDir, normalizeStrForUrl } from "./utils";
import { putDirToBucket } from "./s3";

export async function generatePRPreview(context: Context<"pull_request">) {
  const pr = context.payload.pull_request;
  const owner = pr.base.repo.owner.login;
  const nOwner = normalizeStrForUrl(owner);
  const repo = pr.base.repo.name;
  const nRepo = normalizeStrForUrl(repo);
  const number = pr.number;
  const ref = pr.head.ref;
  const nRef = normalizeStrForUrl(ref);
  const sha = pr.head.sha;
  const shortSha = sha.substring(0, 7);

  const tempDir = getOrCreateTempDir("fable-doc-bot-builds")
  const repoFolderName = `${nOwner}-${nRepo}-${nRef}-${number}-${shortSha}`
  const repoDir = path.join(tempDir, repoFolderName);

  const isPrMerged = pr.merged;
  const isPrClosed = context.payload.action === "closed";

  const currentRepoObj = context.repo();
  let deploymentId = 0;

  if (isPrClosed && !isPrMerged) {
    // Pr has been closed without mergeing, TODO delete old deployment if any
    return;
  }

  try {
    context.log.info("Cloning the repo...");
    execSync(`git clone --depth 1 git@github.com:${owner}/${repo}.git ${repoDir}`);
    context.log.info("Pulling the latest head & building the repo...");
    execSync(`git fetch origin pull/${number}/head:pr-${number} && git checkout pr-${number}`, { stdio: 'inherit', cwd: repoDir });

    // TODO FIXME temporary until the full platform is developed
    const db = JSON.parse(await readFile(`${repoDir}/temp/db.json`, { encoding: "utf8" }));

    let rootDirInS3 = `${shortSha}-${nRef}-${nRepo}`;
    let urlToAccess = `https://${rootDirInS3}--preview.${db.site}`;
    let env = "Preview";
    if (isPrMerged && pr.base.ref === db.prodBranch) {
      execSync(`git fetch && git checkout ${pr.base.ref}`, { stdio: 'inherit', cwd: repoDir });
      // If the pr has been merged to the branch from where production deployment is done. Update production deployment
      // TODO create cloudfront invalidation
      rootDirInS3 = `prod-${db.site}`
      urlToAccess = `https://${db.site}`;
      env = "Production";
    }

    const deployment = await context.octokit.repos.createDeployment({
      ...currentRepoObj,
      ref: pr.head.ref,
      environment: env
    });
    if (deployment.data) deploymentId = (deployment.data as any).id || 0;
    if (deploymentId) {
      await context.octokit.repos.createDeploymentStatus({
        ...currentRepoObj,
        deployment_id: deploymentId,
        state: 'in_progress'
      });
    }

    execSync("fable-doc build", { stdio: 'inherit', cwd: repoDir });

    context.log.info(`Uploading ${repoDir}/build to bucket=${db.bucketName} root=${rootDirInS3}`);
    const files = await putDirToBucket({
      region: 'us-east-1',
      bucketName: "documentden-deployments",
      prefixPath: "",
      rootDir: rootDirInS3,
      absPathOfDirRootToUpload: `${repoDir}/build`
    });

    if (deploymentId) {
      await context.octokit.repos.createDeploymentStatus({
        ...currentRepoObj,
        deployment_id: deploymentId,
        state: 'success',
        environment_url: urlToAccess,
        log_url: urlToAccess
      })
    }
    context.log.info(`Deployment successful. File written are following`);
    context.log.info(files.map(f => `${f.file} [${f.type}]`));
    context.log.warn(`Access preview environment ${urlToAccess}`)
  } catch (error) {
    const e = error as Error;
    context.log.error(e);
    const pr = context.issue({ body: `\`\`\`js\n${e.stack}\n\`\`\`` || "Error occurred" });
    await context.octokit.issues.createComment(pr);
    if (deploymentId) {
      await context.octokit.repos.createDeploymentStatus({
        ...currentRepoObj,
        deployment_id: deploymentId,
        state: 'failure',
      })
    }
  } finally {
    context.log.info("Removing temporary file");
    await rm(repoDir, { recursive: true })
  }
}