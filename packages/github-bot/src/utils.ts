import { accessSync, existsSync, mkdirSync, readFileSync,constants } from "fs";
import { tmpdir } from "os";
import * as path from "path";
import esbuild from "esbuild";

export const getOrCreateTempDir = (folderName: string): string => {
    const tempDir = path.join(tmpdir(), folderName,)

    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }

    return tempDir;
}

export const extractImportPaths = (filePath: string) => {
    const content = readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
  
    const importPaths = [];
    let match;
  
    while ((match = importRegex.exec(content)) !== null) {
      const importedModule = match[1];
      const importedPath = match[2];
      const fullPath = path.resolve(path.dirname(filePath), importedPath);
      importPaths.push({ module: importedModule, path: fullPath, importedPath });
    }
  
    return importPaths;
}

export const checkFileExistence = (filePath: string): boolean => {
  try {
    accessSync(filePath, constants.R_OK);
    return true; 
  } catch (err) {
    return false;
  }
}

export const getAbsPath = (currPath: string, relPath: string) => {
  return path.resolve(currPath, relPath);
}

export async function bundle(toBeBundledPath: string, outFilePath: string) {
  try {
    await esbuild.build({
      entryPoints: [toBeBundledPath],
      bundle: true,
      outfile: outFilePath,
      format: 'esm',
      minify: false,
      loader: { '.js': 'jsx' },
      external: ["react"],
    });

    console.log('Build successful!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}