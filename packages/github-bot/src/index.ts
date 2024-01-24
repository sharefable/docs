import { ApplicationFunctionOptions, Probot } from "probot";
import { generatePRPreview } from "./build-pr";
import { Request, Response } from "express";
import { getImportedFileContent, getManifestConfig } from "./get-manifest-config";
import cors from "cors";
// import { Context } from "probot";

export default (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  // app.on('pull_request.synchronize', async (ctx: Context<"pull_request">) => {
  // const repo = ctx.repo();
  // const depl = await ctx.octokit.repos.listDeployments({
  //   ...repo,
  //   ref: ctx.payload.pull_request.head.ref,
  //   environment: "Preview"
  // })

  // ctx.log.info(depl);

  // await ctx.octokit.repos.createDeploymentStatus({
  //   ...repo,
  //   deployment_id: depl.data[0].id,
  //   state: "inactive"
  // })
  // ctx.log.info("received");

  // const pr = ctx.issue({ body: "this pr has been updated" });
  // ctx.log.info('pr updated' + JSON.stringify(pr, null, 2));
  // ctx.octokit.issues.createComment(pr);

  // const repo = ctx.repo();
  // const deployment = await ctx.octokit.repos.createDeployment({
  //   ...repo,
  //   ref: ctx.payload.pull_request.head.ref,
  //   environment: "Preview"
  // });
  // const deployment_id = (deployment.data as any).id || 0;

  // setTimeout(() => {
  //   ctx.log.info('makring deployment as in progress ' + deployment_id);
  //   if (deployment_id) {
  //     ctx.octokit.repos.createDeploymentStatus({
  //       ...repo,
  //       deployment_id,
  //       state: 'in_progress'
  //     })
  //   }
  // }, 3000);

  // setTimeout(() => {
  //   ctx.log.info('makring deployment as done ' + deployment_id);
  //   if (deployment_id) {
  //     ctx.octokit.repos.createDeploymentStatus({
  //       ...repo,
  //       deployment_id,
  //       state: 'success',
  //       environment_url: "https://sharefable.com",
  //       log_url: "https://sharefable.com"
  //     })
  //   }
  // }, 10000);

  // });

  app.on([ "pull_request.opened",
    "pull_request.reopened",
    "pull_request.synchronize",
    "pull_request.closed"
  ], generatePRPreview);

  // app.on('pull_request.closed', (ctx: Context<"pull_request">) => {
  //   // const repo = ctx.repo();
  //   // ctx.octokit.repos.getDeployment();
  //   ctx.log.info('pr closed');
  // });

  // app.on('pull_request.synchronize', generatePRPreview);
  // app.on('pull_request.opened', generatePRPreview);

  if (getRouter) {
    const router = getRouter();
    router.use(cors());
    router.get("/health", (_: Request, resp: Response) => {
      resp.status(200).json({ status: "up" });
    });
    router.get("/repo-details", getManifestConfig);
    router.get("/imported-file-content", getImportedFileContent)
  }
};
