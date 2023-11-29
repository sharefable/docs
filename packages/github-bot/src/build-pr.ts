import { Context } from "probot";

import { execSync } from "child_process";
import * as path from "path";
import { tmpdir } from 'os'
import { existsSync, mkdirSync } from "fs";
import { rmSync } from "fs";


export async function generatePRPreview (context: Context<"pull_request">)  {
    const pr = context.payload.pull_request;
    const owner = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;
    const number = pr.number;
    const sha = pr.head.sha;

    try {
      const tempDir = path.join(tmpdir(), "fable-doc-bot-builds",)

      if (!existsSync(tempDir)) {
        console.log("before mkdir")
        mkdirSync(tempDir);
      }

      const repoFolderName = `${owner}-${repo}-${number}-${sha}`
      const repoDir = path.join(tempDir, repoFolderName);
    
      // Clone the repository 
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
  
      console.log(">>> cleaning up")
      // Clean up the temporary directory
      rmSync(repoDir, { recursive: true })
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  }