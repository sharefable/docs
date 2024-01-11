import { Plugin, transform } from "esbuild"
import { readFileSync } from "fs";

export const CSSMinifyPlugin: Plugin = {
    name: "CSSMinifyPlugin",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const f = readFileSync(args.path)
            const css = await transform(f, { loader: "css", minify: true })
            return { loader: "text", contents: css.code }
        })
    }
}