import esbuild from "esbuild-wasm";

export const cssPlugin = (input: Record<string, string>)=> {
  return {
    name: "css-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /\.css$/ }, (args) => {
        return {
          path: args.resolveDir === "/" ? args.path : `.${  args.resolveDir  }${args.path.substring(1)}`,
          namespace: "css",
        };
      }),
      build.onLoad({ filter: /.*/, namespace: "css" }, async (args) => {
        const f = await input[args.path.substring(2)];

        const escaped = f
          .replace(/\n/g, "")
          .replace(/"/g, "\\\"")
          .replace(/'/g, "\\'");

        const contents = `
            const style = document.createElement("style");
            style.innerText = "${escaped}";
            document.head.appendChild(style);
          `;
        return { loader: "jsx", contents: contents };
      });
    }
  };
};