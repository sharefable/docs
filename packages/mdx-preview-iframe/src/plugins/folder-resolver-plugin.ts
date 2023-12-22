import esbuild from 'esbuild-wasm';

export const folderResolverPlugin = (input: Record<string, string>) => {
  return {
    name: "es-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if(args.path.includes('.svg')){
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