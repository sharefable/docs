const fs = require('fs');
const path = require('path');

const fileMap = {
    "./static/assets/hamburger-menu.svg": "hambergerSvg",
    "./static/components/hamburger/index.css": "hamburgerCss",
    "./static/components/hamburger/index.js": "hamburgerCode",
    "./static/components/header/index.css": "headerCss",
    "./static/components/header/index.js": "headerCode",
    "./static/components/sidepanel/index.css": "sidePanelCss",
    "./static/components/sidepanel/index.js": "sidePanelCode",
    "./static/index.css": "indexCss",
    "./static/Layout.js": "layoutCode",
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