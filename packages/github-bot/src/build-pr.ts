import { Context } from "probot";

import { execSync } from "child_process";
import * as path from "path";
import { rmSync } from "fs";
import { getOrCreateTempDir } from "./utils";


export async function generatePRPreview (context: Context<"pull_request">)  {
    const pr = context.payload.pull_request;
    const owner = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;
    const number = pr.number;
    const sha = pr.head.sha;

    try {
      const tempDir = getOrCreateTempDir("fable-doc-bot-builds")

      const repoFolderName = `${owner}-${repo}-${number}-${sha}`
      const repoDir = path.join(tempDir, repoFolderName);

      // clone the repository
      execSync(`git clone --depth 1 https://github.com/${owner}/${repo}.git ${repoDir}`);

      // Checkout the pull request branch and building it     
      execSync(`git fetch origin pull/${number}/head:pr-${number} && git checkout pr-${number} && fable-doc build`
      , { stdio: 'inherit', cwd: repoDir });
      
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: 'Here is ur preview URL',
      });
  
      // Clean up the temporary directory
      rmSync(repoDir, { recursive: true })
    
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  }