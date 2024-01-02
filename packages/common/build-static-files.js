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
const cliStaticDir = '../cli/static'
const commonStaticDir = './static'

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

function copyStaticFileToCli(sourceDir, destinationDir){
  const sourcePath = path.resolve(sourceDir);
  const destinationPath = path.resolve(destinationDir);

  try{
    const files = fs.readdirSync(sourcePath);
    if(!fs.existsSync(destinationPath)){
      fs.mkdirSync(destinationPath);
    }

    files.forEach(file=> {
      const sourceFile = path.join(sourcePath, file);
      const destinationFile = path.join(destinationPath, file);

      if(fs.statSync(sourceFile).isDirectory()){
        copyStaticFileToCli(path.join(sourceDir, file), path.join(destinationDir, file))
      }else{
        const data = fs.readFileSync(sourceFile);
        fs.writeFileSync(destinationFile, data);
      }
    })
  }catch(e){
    console.log('error in copying dir: ',e)
  }
}


generateTsFile();
copyStaticFileToCli(commonStaticDir, cliStaticDir);