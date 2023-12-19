import { FSSerialized } from "@fable-doc/fs-ser/dist/esm";
import { FSSerNode } from "@fable-doc/fs-ser/dist/esm/types";
import { writeFileSync } from "fs";
import { parse, relative, resolve, sep } from "path";

function convertToCamelCase(str: string): string {
  return str.split("-").map(part => part[0]?.toUpperCase() + part.slice(1)).join("");
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

export const createRouterContent = (fsSerManifest: FSSerialized) => {
  const filePaths = getFilePaths(fsSerManifest.tree)

  const importStatements = filePaths.map(file => {
    return `const ${convertToCamelCase(file.fileName)} = lazy(() => import('./mdx-dist/${(file.filePath)}'));`;
  });

  const routerConfig = filePaths.map(file => {
    return `  {
    path: "/${file.filePath}",
    element: <${convertToCamelCase(file.fileName)}/>,
  },`;
  });

  const outputContent = `
  import React, { lazy } from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  ${importStatements.join('\n')}


const filePaths = [${filePaths.map(file => `"/${file.filePath}"`).join(',')}]
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

export const generateRouterFile = (fsSerManifest: FSSerialized, outputFile: string): void => {
  const routerContent = createRouterContent(fsSerManifest)

  writeFileSync(outputFile, routerContent);
}

