import path, { join } from "path";
import { 
  defaultConfig, 
  generateUserAndDefaultCombinedConfig,  
  getUserConfig ,
  getSidepanelLinks,
} from "@fable-doc/common/dist/utils";
import { execSync } from "child_process";
// @ts-ignore
import serialize from "@fable-doc/fs-ser/dist/cjs2/index.js";
import { existsSync } from "fs";
import { rmSync } from "fs";
import { getOrCreateTempDir } from "./utils";

export const getManifestConfig = async (req: any, res: any) => {
    let repoDir: string = "";
    try {
      const { owner, repo, branch } = req.query;
      const repoFolderName = `${owner}-${repo}-${branch}-${Math.random()}`

      const tempDir = getOrCreateTempDir("fable-doc-bot-ext-clones")
      repoDir = path.join(tempDir, repoFolderName);

      execSync(`git clone --depth 1 -b ${branch} https://github.com/${owner}/${repo}.git ${repoDir}`);

      const manifest = await serialize({
        serStartsFromAbsDir: repoDir,
        outputFilePath: path.join(repoDir, 'fable-doc-bot-dist'),
        donotTraverseList: ["**/config.js"]
      })

      let config;
      const userConfigFilePath = join(repoDir, 'config.js')
      if (!existsSync(userConfigFilePath)) {
        config = defaultConfig;
      } else {
        const userConfig = getUserConfig(userConfigFilePath);
        config = generateUserAndDefaultCombinedConfig(
          userConfig,
          manifest,
          repoDir,
        )
      }

      const sidePanelLinks = getSidepanelLinks(manifest.tree, config.urlMapping, repoDir)

      res
      .status(200)
      .json({ 
        res: "success", 
        manifest, 
        config, 
        sidePanelLinks 
      })
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      repoDir.length && rmSync(repoDir, { recursive: true })
    }
  }
