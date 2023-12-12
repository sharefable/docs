import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as esbuild from 'esbuild-wasm';

import { VFile } from 'vfile'
import { createFormatAwareProcessors } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import { setDataPlugin } from './plugins/set-data-plugin';
import { resetFileSystem } from './plugins/fs';
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { fallbackCode, initialCode } from './content';

let initialized = false;

const getBuild = async (inputCode: string) => {
  try {
    const input = {
      'index.jsx': initialCode,
      'file.jsx': inputCode,
      'fallBack.jsx': fallbackCode
    }
    resetFileSystem(input)
    const result = await esbuild.build({
      entryPoints: ['index.jsx'],
      write: false,
      bundle: true,
      format: 'esm',
      globalName: 'Output',
    })

    const PREVIEW_ID = 'main-block'
    const script = document.getElementById(PREVIEW_ID)

    const newScript = document.createElement('script')
    newScript.type = 'module'
    newScript.id = PREVIEW_ID
    newScript.innerHTML = result.outputFiles[0].text;
    if (!script) {
      document.body.append(newScript)
    }else{
      script.parentNode?.replaceChild(newScript, script)
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
  await mdxBuild(code);
}

const mdxBuild = async (data: string) => {
  const { process } = createFormatAwareProcessors({
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight]
  })
  try {
    const result = await esbuild.build({
      entryPoints: ['<stdin>'],
      write: false,
      bundle: true,
      format: 'esm',
      // minify: true,
      plugins: [
        globalExternals({
          'react/jsx-runtime': {
            varName: '_jsx_runtime',
            type: 'esm',
            namedExports: ['Fragment', 'jsx', 'jsxs'],
            defaultExport: false
          }
        }),
        setDataPlugin(data),
        {
          name: "esbuild-mdx",
          setup(build) {
            build.onLoad({ filter: /.*/, namespace: 'stdin' }, async (args) => {
              let file = new VFile({ path: args.path, value: args.pluginData })
              file = await process(file)
              const contents = file.value
              return {
                contents: contents,
                loader: "jsx",
                pluginData: contents
              }
            })
          }
        }
      ],
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      jsx: 'automatic'
    })
    getBuild((result.outputFiles[0].text).replace('var { Fragment, jsx, jsxs } = _jsx_runtime;', 'import {Fragment, jsx, jsxs} from "https://esm.sh/react/jsx-runtime"'))
  } catch (e) {
    console.log('error in mdx build', e)
    const script = document.getElementById('root')
    script!.innerHTML = e as string;
  }
}

const Container = () => {
  useEffect(() => {
    window.addEventListener('message', (event) => {
      init(event.data.data)
    })
  }, [])

  return (
    <>
    </>
  )
}


const root = createRoot(document.getElementById("root")!)
root.render(<Container />)