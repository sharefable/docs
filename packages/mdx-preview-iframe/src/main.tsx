import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as esbuild from 'esbuild-wasm';

import {hambergerSvg, hamburgerCode, hamburgerCss, headerCss, headerCode, indexCss, layoutCode, sidePanelCode, sidePanelCss} from "./static-files";
import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import { mdxPlugin } from './plugins/mdx-plugin';
import { resetFileSystem } from './plugins/fs';
import { appCode, fallbackCode, initialCode } from './content';
import { cssPlugin } from './plugins/css-plugin';
import { folderResolverPlugin } from './plugins/folder-resolver-plugin';
import { FileName, Msg } from './types';
import { ImportedFileData } from "@fable-doc/common/dist/esm/types"

let initialized = false;
const input: Record<string, string> = {
  [FileName.INDEX_JSX]: initialCode,
  'fallBack.jsx': fallbackCode,
  'app.jsx': appCode,
  'layout.jsx': layoutCode,
  'components/sidepanel/index.css': sidePanelCss,
  'components/sidepanel/index.jsx': sidePanelCode,
  'components/header/index.css': headerCss,
  'components/header/index.jsx': headerCode,
  'index.css': indexCss,
  'components/hamburger/index.css': hamburgerCss,
  'components/hamburger/index.jsx': hamburgerCode,
  'assets/hamburger-menu.svg': hambergerSvg
}

const handleReactBuild = (text: string) => {
  const PREVIEW_ID = 'main-block'
  const script = document.getElementById(PREVIEW_ID)

  const newScript = document.createElement('script')
  newScript.type = 'module'
  newScript.id = PREVIEW_ID
  newScript.innerHTML = text;
  if (!script) {
    document.body.append(newScript)
  } else {
    script.parentNode?.replaceChild(newScript, script)
  }
}

const getBuild = async (entryPoint: string, buildType: 'react' | 'mdx') => {
  try {
    resetFileSystem(input)
    const result = await esbuild.build({
      entryPoints: [entryPoint],
      write: false,
      bundle: true,
      format: 'esm',
      outdir: './',
      loader: { ".js": "js", '.css': "css", '.jsx': "jsx" },
      plugins: [
        globalExternals({
          'react/jsx-runtime': {
            varName: '_jsx_runtime',
            type: 'esm',
            namedExports: ['Fragment', 'jsx', 'jsxs'],
            defaultExport: false
          }
        }),
        folderResolverPlugin(input),
        cssPlugin(input),
        mdxPlugin(input),
      ]
    })
    if (buildType === 'mdx') {
      const inputCode = result.outputFiles[0].text.replace('var { Fragment, jsx, jsxs } = _jsx_runtime;', 'import {Fragment, jsx, jsxs} from "https://esm.sh/react/jsx-runtime"')
      input[FileName.MDX_BUILD_JSX] = inputCode;
      getBuild(FileName.INDEX_JSX, 'react')
    } else {
      handleReactBuild(result.outputFiles[0].text)
    }
  } catch (e) {
    console.log('build failed', e)
    const script = document.getElementById('root')
    script!.innerHTML = e as string;
  }
}

const init = async (code: string) => {
  if (!initialized) {
    await esbuild.initialize({
      worker: false,
      wasmURL: 'https://www.unpkg.com/esbuild-wasm@0.19.9/esbuild.wasm'
    })
    initialized = true;
  }
  input[FileName.CODE_MDX] = code;
  
  // build only if we receive manifest and config
  if(input[FileName.CONFIG_JSON] && input[FileName.MANIFEST_JSON])
  await getBuild(FileName.CODE_MDX, 'mdx');
}

let configInited = false;
const Container = () => {
  async function handleMessage(event: MessageEvent) {
    if (event.data.type === Msg.MDX_DATA) {
      if(!configInited) return;
      await init(event.data.data)
    }
    else if(event.data.type === Msg.CONFIG_DATA){
      input[FileName.CONFIG_JSON] = JSON.stringify(event.data.data.config)
      input[FileName.MANIFEST_JSON] = JSON.stringify(event.data.data.manifest)
      input[FileName.SIDEPANEL_JSON] = JSON.stringify(event.data.data.sidePanelLinks)
      input[FileName.ROOT_CSS] = event.data.data.rootCssData

      const importedFileContents = event.data.data.importedFileContents as ImportedFileData[];
      importedFileContents.forEach((el) => {
        input[el.importedPath.split("./").join("")] = el.content;
      })
      configInited = true;
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <>
    </>
  )
}


const root = createRoot(document.getElementById("root")!)
root.render(<Container />)