import { join, parse, resolve } from 'path';
import * as fs from 'fs'
import { tmpdir } from 'os'

const tempDir = join(tmpdir(), 'demo-doc-dist');

interface FileName {
  componentName: string; 
  fileName: string;
}

export const createRouterFile = (build: boolean) => {
  const folderPath = join(build ? resolve() : tempDir, 'dist', 'src', 'mdx-dist')
  const outputFile = join(build ? resolve() : tempDir, 'dist', 'src', 'router.js')

  const fileNames: FileName[] = []
  fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const fileNameWithoutExtension = parse(file).name;
      const camelCaseName = convertToCamelCase(fileNameWithoutExtension);
      fileNames.push({ componentName: camelCaseName, fileName: fileNameWithoutExtension })
    })

  const newJSFileContent = getNewJSFileContent(fileNames);

  fs.writeFileSync(outputFile, newJSFileContent);

  function getNewJSFileContent(fileNames: FileName[]) {
    const importStatements = fileNames.map(file => {
      return `const ${file.componentName} = lazy(() => import('./mdx-dist/${file.fileName}'));`;
    });

    const routerConfig = fileNames.map(file => {
      return `  {
      path: "/${file.fileName}",
      element: <${file.componentName}/>,
    },`;
    });

    const getFilePathsArr = fileNames.map(file => {
        return `"/${file.fileName}"`
    })

    const outputContent = `
    import React, { lazy } from 'react';
    import { createBrowserRouter } from 'react-router-dom';
  ${importStatements.join('\n')}
  
  
  
  const filePaths = [${getFilePathsArr.join(", ")}]
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

    return outputContent;
  }

  function convertToCamelCase(str: string) {
    return str.split("-").map(part => part[0]?.toUpperCase() + part.slice(1)).join("");
  }
}
