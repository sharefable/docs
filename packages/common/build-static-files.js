const fs = require('fs');
const path = require('path');

const fileMap = {
    "./static/assets/hamburger-menu.svg": "hambergerSvg",
    "./static/layouts/standard-blog-layout/components/hamburger/index.css": "hamburgerCss",
    "./static/layouts/standard-blog-layout/components/hamburger/index.js": "hamburgerCode",
    "./static/layouts/standard-blog-layout/components/header/index.css": "headerCss",
    "./static/layouts/standard-blog-layout/components/header/index.js": "headerCode",
    "./static/layouts/standard-blog-layout/components/sidepanel/index.css": "sidePanelCss",
    "./static/layouts/standard-blog-layout/components/sidepanel/index.js": "sidePanelCode",
    "./static/index.css": "indexCss",
    "./static/layouts/standard-blog-layout/Layout.js": "layoutCode",
}


const tsFilePath = '../mdx-preview-iframe/src/static-files.ts';

function generateTsFile() {
  const tsFileContents = Object.entries(fileMap).map(([filePath, variableName]) => {
    const absolutePath = path.resolve(filePath);
    const fileContents = fs.readFileSync(absolutePath, 'utf-8');
    const esmFileContents= convertImportsToESM(fileContents);
    return `export const ${variableName} = \`${esmFileContents}\`;\n`;
  }).join('\n');

  fs.writeFileSync(tsFilePath, tsFileContents);

  console.log(`TypeScript file generated at: ${tsFilePath}`);
}

function convertImportsToESM(content) {

    const map = {
        [`from "react"`]: `from "https://esm.sh/react@18.2.0"`,
        [`from 'react'`]: `from "https://esm.sh/react@18.2.0"`,
        [`from "react-router-dom"`]: `from "https://esm.sh/react-router-dom"`,
        [`from 'react-router-dom'`]: `from "https://esm.sh/react-router-dom"`,
    }

    Object.entries(map).forEach(([str, esmImport]) => {
        content = content.replaceAll(str, esmImport);
    })

    return content;
}

generateTsFile();