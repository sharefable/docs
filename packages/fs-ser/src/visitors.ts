// @ts-ignore
import remarkHeadingId from "remark-heading-id";
import { readFileSync } from "node:fs";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkStringify from "remark-stringify";
import remarkParseFrontmatter from "remark-parse-frontmatter";
import { unified } from "unified";
import { TVisitors, FSSerNode } from "./types";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import mdx from "@mdx-js/esbuild";
import esbuild from "esbuild";
import remarkHeadings from "@vcarl/remark-headings";

interface FSSerNodeWithContent extends FSSerNode {
  content: string;
}

export type Heading = {
  depth: number;
  value: string;
};

interface FSSerNodeWithFrontMatterAndToc extends FSSerNodeWithContent {
  frontmatter: Record<string, any>;
  toc: Heading[];
}

interface FSSerNodeWithRootData extends FSSerNode {
  mdxfiles: string[]
}

// WARN Right now the visitors can only inline mutate an node by adding property.
//      There is no sealing agaist a rough visitor might delete necessary property.
//      Later.

export function contentReaderVisitor(): TVisitors {
  const visitor: TVisitors = {
    "file[ext=.mdx|ext=.md]": {
      async exit(node: FSSerNode) {
        const n = node as FSSerNodeWithContent;
        n.content = readFileSync(node.absPath, "utf8");
      }
    }
  };

  return visitor;
};


interface TState extends Record<string, any>{
  mdxfiles: string[]
}

export function contentTransformerVisitor(): TVisitors {
  const visitor: TVisitors = {
    dir: {
      async enter(node: FSSerNode, state: TState) {
        if (node.isRoot) state.mdxfiles = [];
      },
      async exit(node: FSSerNodeWithRootData, state: TState) {
        if (node.isRoot) node.mdxfiles = state.mdxfiles;
      }
    },
    "file[ext=.mdx|ext=.md]": {
      async exit(node: FSSerNodeWithFrontMatterAndToc, state: TState) {
        const content = node.content;
        const transformedContent =
          await unified()
            .use(remarkParse)
            .use(remarkStringify)
            .use(() => remarkHeadingId({ defaults: true, uniqueDefaults: true }))
            .use(remarkHeadings)
            .use(remarkFrontmatter, ["yaml"])
            .use(remarkParseFrontmatter)
            .process(content);
        state.mdxfiles.push(node.absPath);
        node.frontmatter = transformedContent.data.frontmatter || {};
        node.toc = transformedContent.data.headings as Heading[] || [];
      }
    }
  };

  return visitor;
}

export function contentGeneratorVisitor(outputPath: string) {
  const visitor: TVisitors = {
    dir: {
      async exit(node: FSSerNodeWithRootData) {
        if (node.isRoot) {
          await esbuild.build({
            // Replace `index.js` with your entry point that imports MDX files:
            entryPoints: [...node.mdxfiles],
            format: "esm",
            loader: { ".js": "jsx", ".css": "copy" },
            bundle: true,
            external: ["react/jsx-runtime", "react", "react-router-dom", "fable-hoc"],
            outdir: outputPath,
            plugins: [mdx({
              remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, () => remarkHeadingId({ defaults: true, uniqueDefaults: true })],
              rehypePlugins: [() => rehypeAutolinkHeadings({ behavior: "append" })]
            })]
          });
        };
      }
    }
  };

  return visitor;
}

export function cleanupVisitor(props: string[]): TVisitors {
  const visitor: TVisitors = {
    "file|dir": {
      async exit(node: FSSerNode) {
        for (const prop of props) {
          delete (node as Record<string, any>)[prop];
        }
      }
    }
  };

  return visitor;
};
