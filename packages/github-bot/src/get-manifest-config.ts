import path, { join } from "path";
import {
  generateManifestAndCombinedConfig,
  constructLinksTree,
  handleComponentSwapping,
  getLayoutContents,
  getDirectoriesInManifest
} from "@fable-doc/common";
import { execSync } from "child_process";
// @ts-expect-error it doesn't have type declaration
import serialize from "@fable-doc/fs-ser/dist/cjs2/index.js";
import { existsSync, rmSync, readFileSync, mkdirSync } from "fs";
import { 
  bundle, 
  checkFileExistence, 
  extractImportPaths, 
  findDirPathMatch, 
  getAbsPath, 
  getOrCreateTempDir 
} from "./utils";
import { ImportedFileData } from "@fable-doc/common/dist/cjs/types";
// @ts-expect-error it doesn't have type declaration
import defaultConfig from "@fable-doc/common/dist/static/config.js";
import { LayoutData } from "@fable-doc/common/dist/esm/types";

export const getManifestConfig = async (req: any, res: any) => {
  let repoDir: string = "";
  try {
    const staticLayoutPath = "./dist/static";
    const { owner, repo, branch, relFilePath } = req.query;
    const repoFolderName = `${owner}-${repo}-${branch}-${Math.random()}`;

    const tempDir = getOrCreateTempDir("fable-doc-bot-ext-clones");
    repoDir = path.join(tempDir, repoFolderName);
    const distLoc = join(repoDir, "dist");

    const getUserFileLoc = (...pathFrag: string[]) => join(repoDir, ...pathFrag);
    const userlandRoot = getUserFileLoc();

    execSync(`git clone --depth 1 -b ${branch} https://github.com/${owner}/${repo}.git ${repoDir}`);

    const manifest = await serialize({
      serStartsFromAbsDir: repoDir,
      outputFilePath: path.join(repoDir, "fable-doc-bot-dist"),
      donotTraverseList: ["**/config.js"]
    });

    let sidePanelLinks;
    const handleFolderLevelConfig = async (dirPath: string) => {
      const combinedData = generateManifestAndCombinedConfig(manifest, userlandRoot, dirPath, getUserFileLoc(dirPath));

      await handleComponentSwapping(getUserFileLoc, dirPath, combinedData.config, distLoc, staticLayoutPath);
  
      sidePanelLinks = constructLinksTree(manifest.tree, combinedData.config.urlMapping, repoDir);
    };

    const dirPaths = getDirectoriesInManifest(manifest.tree)
      .map(dir => dir.split("/").slice(1).join("/"))
      .filter(dir => existsSync(getUserFileLoc(dir, "config.js")));

    for (const dir of dirPaths) {
      await handleFolderLevelConfig(dir);
    }

    let config;
    const userConfigFilePath = join(repoDir, "config.js");
    if (!existsSync(userConfigFilePath)) {
      config = defaultConfig;
    } else {
      const combinedData = generateManifestAndCombinedConfig(
        manifest,
        repoDir,
        dirPaths[0],
        getUserFileLoc(dirPaths[0])
      );
      config = combinedData.config;
    }

    const absFilePath = getAbsPath(repoDir, relFilePath);
    const content = readFileSync(absFilePath, "utf-8");

    const importedFilesAbsPaths = extractImportPaths(content, absFilePath)
      .filter(el => checkFileExistence(el.path));

    const importedFileContents: ImportedFileData[] = await Promise.all(importedFilesAbsPaths.map(async (el) => {
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

    if (!existsSync(distLoc)) mkdirSync(distLoc);
    await handleComponentSwapping(getUserFileLoc, dirPaths[0], config, distLoc, staticLayoutPath);
    const layoutContents: LayoutData[] = getLayoutContents(distLoc, findDirPathMatch(dirPaths, relFilePath));

    res
      .status(200)
      .json({
        res: "success",
        manifest,
        config,
        sidePanelLinks,
        importedFileContents,
        layoutContents,
        repoFolderName
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getImportedFileContent = async (req: any, res: any) => {
  try {
    const { repoFolderName, relFilePath, content, branch, owner, repo } = req.query;
    const tempDir = getOrCreateTempDir("fable-doc-bot-ext-clones");
    const repoDir = path.join(tempDir, repoFolderName);

    if (!checkFileExistence(repoDir)) {
      execSync(`git clone --depth 1 -b ${branch} https://github.com/${owner}/${repo}.git ${repoDir}`);
    }

    const absFilePath = getAbsPath(repoDir, relFilePath);

    const importedFilesAbsPaths = extractImportPaths(content, absFilePath)
      .filter(el => checkFileExistence(el.path));

    const importedFileContents: ImportedFileData[] = await Promise.all(importedFilesAbsPaths.map(async (el) => {
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

    res.
      status(200)
      .json({
        importedFileContents: importedFileContents
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const removeRepo = async (req: any, res: any) => {
  try {
    const { repoFolderName } = req.query;
    const tempDir = getOrCreateTempDir("fable-doc-bot-ext-clones");
    const repoDir = path.join(tempDir, repoFolderName);
    if (checkFileExistence(repoDir)) {
      rmSync(repoDir, { recursive: true });
    }
    res.status(200).json({ message: "Repostory deleted" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};