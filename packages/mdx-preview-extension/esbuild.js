import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";

build({
    entryPoints: {
        popup: "./src/popup.tsx",
        content: "./src/content.ts",
        injectScript: "./src/inject-script.ts",
        background: "./src/background.ts"
    },
    bundle: true,
    outdir: "./build",
    minify: true,
    sourcemap: "inline",
    plugins: [
        copy({
            resolveFrom: "cwd",
            assets: [
                {
                    from: ["./public/*"],
                    to: ["./build/"],
                },
            ],
        }),
    ],
});