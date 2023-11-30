import { vol } from "memfs";
import serialize, { parseFilterStr } from "../src/index";

jest.mock("node:fs/promises");
jest.mock("node:fs");

describe("#serialize", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("Should serialize a flat fs", async () => {
    vol.fromNestedJSON({
      opt: {},
      tmp: {
        input: {
          "index.mdx": `---
title: this is title
desc: this is desc
---


# This is content of mdx

**how are you**

<Button>hello</Button>

## looks like you are good`,
          "index.md": "This is content of md",
        }
      }
    }, "/");

    const tree = await serialize({
      serStartsFromAbsDir: "/tmp/input",
      outputFilePath: "/opt"
    });

    const manifest = {
      version: 1,
      tree: {
        nodeType: "dir",
        nodeName: "input",
        absPath: "/tmp/input/",
        children: [
          { nodeType: "file", nodeName: "index.md", ext: ".md", absPath: "/tmp/input/index.md", frontmatter: {} },
          {
            nodeType: "file",
            nodeName: "index.mdx",
            ext: ".mdx",
            absPath: "/tmp/input/index.mdx",
            frontmatter: {
              desc: "this is desc",
              title: "this is title",
            }
          }
        ]
      }
    };

    expect(tree).toStrictEqual(manifest);
    const writtenFile = vol.readFileSync("/opt/manifest.json", "utf8");
    expect(JSON.parse(writtenFile.toString())).toStrictEqual(manifest);

  });

  it("Should serialize a nested fs", async () => {
    vol.fromNestedJSON({
      opt: {},
      tmp: {
        input: {
          profile: {
            "getting-started.mdx": "Content of getting started mdx",
          },
          "index.md": ""
        }
      }
    }, "/");

    const tree = await serialize({
      serStartsFromAbsDir: "/tmp/input",
      outputFilePath: "/opt"
    });

    expect(tree).toStrictEqual({
      version: 1,
      tree: {
        nodeType: "dir",
        nodeName: "input",
        absPath: "/tmp/input/",
        children: [
          { nodeType: "file", nodeName: "index.md", ext: ".md", absPath: "/tmp/input/index.md", frontmatter: {} },
          {
            nodeType: "dir",
            nodeName: "profile",
            absPath: "/tmp/input/profile/",
            children: [
              { nodeType: "file", nodeName: "getting-started.mdx", ext: ".mdx", absPath: "/tmp/input/profile/getting-started.mdx", frontmatter: {} }
            ]
          }
        ]
      }
    }
    );
  });

  it("Should respect default ignored dir", async () => {
    vol.fromJSON({
      "/tmp/input/node_modules/lib1/index.js": "",
      "/tmp/input/node_modules/lib1/main.js": "",
      "/tmp/input/node_modules/lib2/main.js": "",
      "/tmp/input/.git/hooks/hook1": "",
      "/tmp/input/.git/config": "",
      "/tmp/input/.gitignore": "",
      "/tmp/input/settings/index.md": "",
      "/tmp/input/profile.md": "",
      "/opt/manifest.json": ""
    }, "/");

    const tree = await serialize({
      serStartsFromAbsDir: "/tmp/input",
      donotTraverseList: ["**/index.md"],
      outputFilePath: "/opt"
    });

    expect(tree).toMatchObject({
      version: 1,
      tree: {
        nodeType: "dir",
        nodeName: "input",
        absPath: "/tmp/input/",
        children: [
          { nodeType: "file", nodeName: "profile.md", absPath: "/tmp/input/profile.md", ext: ".md" },
          {
            nodeType: "dir",
            nodeName: "settings",
            absPath: "/tmp/input/settings/",
            children: []
          }
        ]
      }
    });
  });
});

describe("#parseFilterStr", () => {
  it("should parse a 1st level filter", () => {
    const p1 = parseFilterStr("dir");
    expect(p1).toStrictEqual({
      dir: {}
    });

    const p2 = parseFilterStr("dir|file");
    expect(p2).toStrictEqual({
      file: {},
      dir: {}
    });
  });

  it("should parse a 1st & 2nd level filter", () => {
    const p1 = parseFilterStr("file[ext=.md|ext=.mdx]|dir");
    expect(p1).toStrictEqual({
      file: {
        ext: [".md", ".mdx"]
      },
      dir: {}
    });

    const p2 = parseFilterStr("file[ext=.md]");
    expect(p2).toStrictEqual({
      file: {
        ext: [".md"]
      },
    });
  });
});
