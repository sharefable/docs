import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as esbuild from 'esbuild-wasm';

import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import { mdxPlugin } from './plugins/mdx-plugin';
import { resetFileSystem } from './plugins/fs';
import { fallbackCode, headerCode, headerCss, indexCss, initialCode, layoutCode, sidePanelCode, sidePanelCss, sidePanelLink } from './content';
import { cssPlugin } from './plugins/css-plugin';
import { folderResolverPlugin } from './plugins/folder-resolver-plugin';
import { Msg } from './types';

let initialized = false;
const input: Record<string, string> = {
  'index.jsx': initialCode,
  'fallBack.jsx': fallbackCode,
  'layout.jsx': layoutCode,
  './component/sidepanel': sidePanelCode,
  './component/header': headerCode,
  'sidepanel-links.json': sidePanelLink,
  'header.css': headerCss,
  'index.css': indexCss,
  'sidePanel.css': sidePanelCss
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
      input['file.jsx'] = inputCode;
      getBuild('index.jsx', 'react')
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
  input['code.mdx'] = code;
  if(input['config.json'])
  await getBuild('code.mdx', 'mdx');
}

const Container = () => {
  function handleMessage(event: MessageEvent) {
    if (event.data.type === Msg.MDX_DATA) init(event.data.data)
    else if(event.data.type === Msg.CONFIG_DATA){
      input['config.json'] = event.data.data.config
      input['manifest.json'] = event.data.data.manifest
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