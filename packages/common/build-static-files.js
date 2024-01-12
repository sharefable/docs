const fs = require('fs');
const path = require('path');

const fileMap = {
    "./static/index.css": "indexCss",
}


const tsFilePath = '../mdx-preview-iframe/src/static-files.ts';

function generateTsFile() {
  const tsFileContents = Object.entries(fileMap).map(([filePath, variableName]) => {
    const absolutePath = path.resolve(filePath);
    const fileContents = fs.readFileSync(absolutePath, 'utf-8');
    const esmFileContents= convertImportsToESM(fileContents);
    const formatedFileContent = formatFileContent(esmFileContents)
    return `export const ${variableName} = \`${formatedFileContent}\`;\n`;
  }).join('\n');

  fs.writeFileSync(tsFilePath, tsFileContents);

  console.log(`TypeScript file generated at: ${tsFilePath}`);
}

function formatFileContent (content) {
  const formatedQuote = content.replaceAll('`', '\\`')
  const formatedDollar = formatedQuote.replaceAll('$', '\\$')
  return formatedDollar;
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