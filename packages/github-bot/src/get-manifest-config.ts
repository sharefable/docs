import path, { join } from "path";
import {
  generateManifestAndCombinedConfig,
  getUserConfig,
  constructLinksTree,
  handleComponentSwapping,
  getStandardCompFilePathMap,
} from "@fable-doc/common";
import { execSync } from "child_process";
// @ts-expect-error it doesn't have type declaration
import serialize from "@fable-doc/fs-ser/dist/cjs2/index.js";
import { existsSync, rmSync, readFileSync, mkdirSync } from "fs";
import { bundle, checkFileExistence, extractImportPaths, getAbsPath, getOrCreateTempDir } from "./utils";
import { ImportedFileData } from "@fable-doc/common/dist/cjs/types";
// @ts-expect-error it doesn't have type declaration
import defaultConfig from "@fable-doc/common/dist/static/config.js";
import { Config, LayoutData } from "@fable-doc/common/dist/esm/types";

export const getManifestConfig = async (req: any, res: any) => {
  let repoDir: string = "";
  try {
    const { owner, repo, branch, relFilePath } = req.query;
    const repoFolderName = `${owner}-${repo}-${branch}-${Math.random()}`;

    const tempDir = getOrCreateTempDir("fable-doc-bot-ext-clones");
    repoDir = path.join(tempDir, repoFolderName);

    execSync(`git clone --depth 1 -b ${branch} https://github.com/${owner}/${repo}.git ${repoDir}`);

    const manifest = await serialize({
      serStartsFromAbsDir: repoDir,
      outputFilePath: path.join(repoDir, "fable-doc-bot-dist"),
      donotTraverseList: ["**/config.js"]
    });

    let config;
    const userConfigFilePath = join(repoDir, "config.js");
    if (!existsSync(userConfigFilePath)) {
      config = defaultConfig;
    } else {
      const userConfig = getUserConfig(userConfigFilePath);

      const combinedData = generateManifestAndCombinedConfig(
        userConfig,
        manifest,
        repoDir
      );
      config = combinedData.config;
    }

    const sidePanelLinks = constructLinksTree(manifest.tree, config.urlMapping, repoDir);

    const absFilePath = getAbsPath(repoDir, relFilePath);

    const importedFilesAbsPaths = extractImportPaths(absFilePath)
      .filter(el => checkFileExistence(el.path));

    const importedFilesContents: ImportedFileData[] = await Promise.all(importedFilesAbsPaths.map(async (el) => {
      const moduleName = el.module;
      const toBeBundledPath = el.path;
      const outputFilePath = path.join(tempDir, repoFolderName, "fable-doc-git-bot", `${moduleName}.js`);

      await bundle(toBeBundledPath, outputFilePath);
      const content = readFileSync(outputFilePath, "utf-8");

      return {
        moduleName,
        content,
        importedPath: el.importedPath,
      };
    }));

    const distLoc = join(tempDir, 'dist')

    if (!existsSync(distLoc)) mkdirSync(distLoc);

    const staticLayoutPath = './dist/static'
    const fileMap: Record<string, string> = getStandardCompFilePathMap(staticLayoutPath);
    await handleComponentSwapping(userConfigFilePath, config, distLoc, staticLayoutPath, repoDir);
    let standardLayoutContents: LayoutData[] = [];

    for (const key in fileMap) {
      if (fileMap.hasOwnProperty(key)) {
        const fileName = key.replace('StandardBlog', '').toLowerCase();
        const parts = fileMap[key].split(/[\\/]/);
        const extractedPath = parts.slice(parts.indexOf('standard-blog-layout') + 1).join('/');
        let componentData: LayoutData = {
          moduleName: fileName,
          content: readFileSync(path.join(distLoc, "src", "layouts", "bundled-layout", extractedPath), "utf-8"),
          filePath: extractedPath
        };
        standardLayoutContents.push(componentData);
      }
    }

    res
      .status(200)
      .json({
        res: "success",
        manifest,
        config,
        sidePanelLinks,
        importedFilesContents,
        standardLayoutContents
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    repoDir.length && rmSync(repoDir, { recursive: true });
  }
};
