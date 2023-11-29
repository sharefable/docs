import { Context } from "probot";

import { execSync } from "child_process";
import * as path from "path";
// import { rmSync } from "fs";


export async function generatePRPreview (context: Context<"pull_request">)  {
    const pr = context.payload.pull_request;
    const owner = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;
    const number = pr.number;
    const sha = pr.head.sha;

    try {
      const repoDir = path.join(__dirname , `${owner}-${repo}-${number}-${sha}`);
    
      // Clone the repository  
      execSync(`git clone --depth 1 https://github.com/${owner}/${repo}.git ${repoDir}`);
  
      // Checkout the pull request branch and building it      
      execSync(`cd ${repoDir} && git fetch origin pull/${number}/head:pr-${number} && git checkout pr-${number} && fable-doc build`);
  
      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: 'Here is ur preview URL',
      });
  
      console.log(">>> cleaning up")
      // Clean up the temporary directory
    //   rmSync(repoDir, { recursive: true })
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  }