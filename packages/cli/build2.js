const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ['./src/cli.ts'],
  bundle: true,
  platform: "node",
  format: "cjs",
  outdir: "./dist/cjs2/",
  external: ["esbuild"]
}).catch(() => {
  process.exit(1);
});
