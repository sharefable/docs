import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";
import {
  readFileSync,
} from "fs";

const configDev = JSON.parse(readFileSync("./configs/config.dev.json", "utf8"));
const configProd = JSON.parse(readFileSync("./configs/config.prod.json", "utf8"));

build({
  entryPoints: {
    popup: "./src/popup.tsx",
    content: "./src/content.ts",
    editorContent: "./src/editor-content.ts",
    background: "./src/background.ts"
  },
  bundle: true,
  outdir: "./build",
  minify: true,
  sourcemap: "inline",
  define: {
    "process.env.CONFIG": JSON.stringify(process.env.NODE_ENV === "production" ? configProd : configDev)
  },
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