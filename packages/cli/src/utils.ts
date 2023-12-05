import { FSSerialized } from "@fable-doc/fs-ser/dist/esm";
import { FSSerNode } from "@fable-doc/fs-ser/dist/esm/types";
import { writeFileSync } from "fs";
import { parse, relative, resolve, sep } from "path";

function parseGlobalPrefix(str: string): string {
  let result = str.replace(/^\//, '');
  if (result && result[result.length - 1] !== '/') result = result + '/'
  return result;
}

function convertToCapsCamelCase(str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const basePath = resolve();
const getRelativePath = (absPath: string) => relative(basePath, absPath);

interface FileDetail {
  fileName: string;
  filePath: string;
}

const getFilePaths = (node: FSSerNode) => {
  const fileDetails: FileDetail[] = [];

  const traverse = (currentNode: FSSerNode, currentPath: string) => {
    if (currentNode.nodeType === "file") {
      const fileName = currentNode.nodeName.replace(/\.[^/.]+$/, '');
      const filePath = parseFilePath(getRelativePath(currentNode.absPath));
      fileDetails.push({ fileName, filePath });
    }

    if (currentNode.children) {
      for (const childNode of currentNode.children) {
        traverse(childNode, currentPath);
      }
    }
  };

  traverse(node, '');

  return fileDetails;
};

const parseFilePath = (filePath: string): string => {
  const pathInfo = parse(filePath);
  const dirComponents = pathInfo.dir.split(sep);
  return !dirComponents[0] ? pathInfo.name : [...dirComponents, pathInfo.name].join('/')
}

const convertFilePathToUrlPath = (path: string): string => {
  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];

  if (lastSegment === 'index') return segments.slice(0, -1).join('/') || '/';
  else if (lastSegment === '') return path.slice(0, -1) || '/';
  else return path;
}

export const createRouterContent = (fsSerManifest: FSSerialized, userUrlMap: UserUrlMap) => {
  const filePaths = getFilePaths(fsSerManifest.tree)

  const globalPrefix = parseGlobalPrefix(userUrlMap.globalPrefix)

  const urlMap: Record<string, { fileName: string, filePath: string }> = {}

  for (const obj of filePaths) {
    urlMap[convertFilePathToUrlPath(obj.filePath)] = { filePath: obj.filePath, fileName: obj.fileName }
  }

  const userUrlMapEntries = userUrlMap.entries as unknown as Record<string, string>

  for (const [urlPath, filePath] of Object.entries(userUrlMapEntries)) {
    urlMap[convertFilePathToUrlPath(urlPath)] = { filePath: parseFilePath(getRelativePath(filePath)), fileName: parse(filePath).name }
  }

  const combinedUrlMap = { ...userUrlMap, entries: urlMap }

  const importStatements = Object.values(combinedUrlMap.entries)
    .filter((value, index, self) => {
      return index === self.findIndex((item) => item.filePath === value.filePath);
    })
    .map(entry => {
      return `const ${convertToCapsCamelCase(entry.filePath)} = lazy(() => import('./mdx-dist/${(entry.filePath)}'));`;
    });

  const routerConfig = Object.entries(combinedUrlMap.entries).map(([urlPath, entry]) => {
    return `  {
            path: "/${globalPrefix}${urlPath === '/' ? '' : urlPath}",
            element: <${convertToCapsCamelCase(entry.filePath)}/>,
          },`;
  });

  const outputContent = `
  import React, { lazy } from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  ${importStatements.join('\n')}

const filePaths = [${Object.keys(combinedUrlMap.entries).map(urlPath => `"/${globalPrefix}${urlPath === '/' ? '' : urlPath}"`).join(',')}]
const bodyEl = document.querySelector("body");

if (!document.querySelector("#invisible-links")) {
  const linksWrapperEl = document.createElement("div");
  linksWrapperEl.setAttribute("id", "invisible-links");
  linksWrapperEl.style.display = "none";
  
  filePaths.forEach((filePath) => {
    const linkEl = document.createElement("a");
    linkEl.setAttribute("href", filePath);
    linksWrapperEl.appendChild(linkEl);
  });
  
  bodyEl.appendChild(linksWrapperEl);
}

export const router = createBrowserRouter([
${routerConfig.join('\n')}
]);
  `;

  return outputContent
}

type UrlEntriesMap = Record<string, { fileName: string, filePath: string }>
interface UserUrlMap {
  globalPrefix: string;
  entries: UrlEntriesMap;
}

type UserUrlMapFn = (manifest: FSSerialized) => UserUrlMap

export const generateRouterFile = (
  fsSerManifest: FSSerialized,
  outputFile: string,
  userUrlMap: UserUrlMap | UserUrlMapFn
): void => {
  if (typeof userUrlMap === 'function') userUrlMap = userUrlMap(fsSerManifest);

  const routerContent = createRouterContent(fsSerManifest, userUrlMap)

  writeFileSync(outputFile, routerContent);
}

