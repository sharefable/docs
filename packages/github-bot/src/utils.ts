import { accessSync, existsSync, mkdirSync, readFileSync, constants } from "fs";
import { tmpdir } from "os";
import * as path from "path";
import esbuild from "esbuild";

export const getOrCreateTempDir = (folderName: string): string => {
  const tempDir = path.join(tmpdir(), folderName);
  if (!existsSync(tempDir)) mkdirSync(tempDir);
  return tempDir;
};

export const normalizeStrForUrl = (str: string): string => {
  return str.replace(/[\W_]+/g, "-").substring(0, 8);
};

export const extractImportPaths = (content: string, filePath: string) => {
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;

  const importPaths = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importedModule = match[1];
    const importedPath = match[2];
    const fullPath = path.resolve(path.dirname(filePath), importedPath);
    importPaths.push({ module: importedModule, path: fullPath, importedPath });
  }
  console.log('<< fin import', importPaths)
  return importPaths;
};

const checkFileExistenceWithExtension = (filePath: string, extensions: string[]): boolean => {
  try {
    accessSync(filePath, constants.R_OK);
    return true;
  } catch (err) {
    for (const extension of extensions) {
      const fullFilePath = `${filePath}.${extension}`;
      try {
        accessSync(fullFilePath, constants.R_OK);
        return true;
      } catch (err) {

      }
    }
  }

  return false;
};

export const checkFileExistence = (filePath: string): boolean => {
  const extensionsToTry = ["jsx", "js"];
  const fileExist = checkFileExistenceWithExtension(filePath, extensionsToTry);
  if (fileExist) {
    return true;
  } else {
    return false;
  }
};

export const getAbsPath = (currPath: string, relPath: string) => {
  return path.resolve(currPath, relPath);
};

export async function bundle(toBeBundledPath: string, outFilePath: string) {
  try {
    await esbuild.build({
      entryPoints: [toBeBundledPath],
      bundle: true,
      outfile: outFilePath,
      format: "esm",
      minify: false,
      loader: { ".js": "jsx" },
      external: ["react"],
    });

    // eslint-disable-next-line no-console
    console.log("Build successful!");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Build failed:", error);
    process.exit(1);
  }
}

export function getRepoFolderName(path: string): string {
  const pathComponents = path.split('/');
  const folderName = pathComponents[pathComponents.length -1];
  return folderName;
}