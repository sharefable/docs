import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as esbuild from 'esbuild-wasm';

import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import { mdxPlugin } from './plugins/mdx-plugin';
import { resetFileSystem } from './plugins/fs';
import { fallbackCode, initialCode } from './content';

let initialized = false;
const input : Record<string, string>= {
  'index.jsx': initialCode,
  'fallBack.jsx': fallbackCode
}

const handleReactBuild = (text: string)=>{
  const PREVIEW_ID = 'main-block'
  const script = document.getElementById(PREVIEW_ID)

  const newScript = document.createElement('script')
  newScript.type = 'module'
  newScript.id = PREVIEW_ID
  newScript.innerHTML = text;
  if (!script) {
    document.body.append(newScript)
  }else{
    script.parentNode?.replaceChild(newScript, script)
  }
}

const getBuild = async (inputCode: string, fileName: string, entryPoint: string, buildType: 'react' | 'mdx') => {
  try {
    input[fileName] = inputCode;
    resetFileSystem(input)
    const result = await esbuild.build({
      entryPoints: [entryPoint],
      write: false,
      bundle: true,
      format: 'esm',
      plugins: [
        globalExternals({
          'react/jsx-runtime': {
            varName: '_jsx_runtime',
            type: 'esm',
            namedExports: ['Fragment', 'jsx', 'jsxs'],
            defaultExport: false
          }
        }),
       mdxPlugin(input)
      ]
    })

    if(buildType === 'mdx'){
      getBuild((result.outputFiles[0].text).replace('var { Fragment, jsx, jsxs } = _jsx_runtime;', 'import {Fragment, jsx, jsxs} from "https://esm.sh/react/jsx-runtime"'), 'file.jsx' ,'index.jsx', 'react')
    }else{
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
  await getBuild(code, 'code.mdx', 'code.mdx', 'mdx');
}

const Container = () => {
  function handleMessage (event: MessageEvent){
    if(event.data.type === 'mdx_data') init(event.data.data)
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)

    return ()=> window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <>
    </>
  )
}


const root = createRoot(document.getElementById("root")!)
root.render(<Container />)