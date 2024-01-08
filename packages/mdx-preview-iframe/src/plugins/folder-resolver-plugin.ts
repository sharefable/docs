import esbuild from 'esbuild-wasm';

export const folderResolverPlugin = (input: Record<string, string>) => {
  return {
    name: "es-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'import-statement' && !(args.path[0] === '.' || args.path.startsWith('https')))
          return {
            path: 'https://esm.sh/' + args.path,
            external: true
          };
      })
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (args.path.includes('.svg')) {
          return {
            loader: 'dataurl',
            contents: input[args.path.substring(1)]
          };
        }
        return null
      })
    }
  }
}