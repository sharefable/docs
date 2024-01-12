import { Plugin, transform } from "esbuild"
import { readFileSync } from "fs";
import path from "path"

export const CSSMinifyPlugin: Plugin = {
    name: "CSSMinifyPlugin",
    setup(build) {
    build.onResolve({ filter: /\.css$/ }, async (args) => {
        const cssFilePath = path.resolve(args.resolveDir, args.path)
        const f = readFileSync(cssFilePath);
        const css = await transform(f, { loader: "css", minify: true })
           
        const contents = `
        const style = document.createElement('style');
        style.textContent = ${JSON.stringify(css.code)};
        document.head.appendChild(style);
        `;

        return { path: args.path, namespace: 'css', pluginData: { contents } };
    });

    build.onLoad({ filter: /.*/, namespace: 'css' }, (args) => {
        return { contents: args.pluginData.contents, loader: 'js' };
    });
    },
};