import esbuild from 'esbuild-wasm';

export const setDataPlugin = (data: string) => {
    return {
        name: 'set-data-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onResolve({ filter: /^<stdin>$/ }, () => {
                return { path: 'test.mdx', namespace: 'stdin', 
                pluginData: data
            };
            });
        }
    }
}