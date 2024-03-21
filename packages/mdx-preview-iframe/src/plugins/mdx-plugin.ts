import { createFormatAwareProcessors } from "@mdx-js/mdx/internal-create-format-aware-processors";
import esbuild from "esbuild-wasm";
import rehypeHighlight from "rehype-highlight";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { VFile } from "vfile";

export const mdxPlugin = (input: Record<string, string>) => {
  const { process } = createFormatAwareProcessors({
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [rehypeHighlight]
  });
  return {
    name: "mdx-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /\.mdx$/ }, (args) => {
        return {
          path: args.path,
          namespace: "mdx"
        };
      });
      build.onLoad({ filter: /.*/, namespace: "mdx" }, async (args) => {
        let file = new VFile({ path: args.path, value: input[args.path.substring(2)].trim() });
        file = await process(file);
        const contents = file.value;
        return {
          contents: contents,
          loader: "jsx",
          pluginData: contents,
          resolveDir: "/"
        };
      });
    }
  };
};