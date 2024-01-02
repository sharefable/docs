import path, { join } from "path";
import {
  generateUserAndDefaultCombinedConfig,
  getUserConfig,
  getSidepanelLinks,
} from "@fable-doc/common";
import { execSync } from "child_process";
// @ts-ignore
import serialize from "@fable-doc/fs-ser/dist/cjs2/index.js";
import { existsSync, rmSync, readFileSync } from "fs";
import { bundle, checkFileExistence, extractImportPaths, getAbsPath, getOrCreateTempDir } from "./utils";
import { ImportedFileData } from "@fable-doc/common/dist/cjs/types"
// @ts-ignore
import defaultConfig from '@fable-doc/common/dist/static/config.js'

export const getManifestConfig = async (req: any, res: any) => {
  let repoDir: string = "";
  try {
    const { owner, repo, branch, relFilePath } = req.query;
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

      const combinedData = generateUserAndDefaultCombinedConfig(
        userConfig,
        manifest,
        repoDir
      )
      config = combinedData.config
    }

    const sidePanelLinks = getSidepanelLinks(manifest.tree, config.urlMapping, repoDir)

    const absFilePath = getAbsPath(repoDir, relFilePath);

    const importedFilesAbsPaths = extractImportPaths(absFilePath)
      .filter(el => checkFileExistence(el.path))

    const importedFilesContents: ImportedFileData[] = await Promise.all(importedFilesAbsPaths.map(async (el) => {
      const moduleName = el.module;
      const toBeBundledPath = el.path;
      const outputFilePath = path.join(tempDir, repoFolderName, "fable-doc-git-bot", `${moduleName}.js`);

      await bundle(toBeBundledPath, outputFilePath);
      const content = readFileSync(outputFilePath, 'utf-8');

      return {
        moduleName,
        content,
        importedPath: el.importedPath,
      }
    }))

    res
      .status(200)
      .json({
        res: "success",
        manifest,
        config,
        sidePanelLinks,
        importedFilesContents,
      })
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    repoDir.length && rmSync(repoDir, { recursive: true })
  }
}
