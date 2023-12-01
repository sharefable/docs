import { minimatch } from "minimatch";
import { lstat, readdir, writeFile } from "node:fs/promises";
import { resolve, extname, dirname, basename } from "node:path";
import { contentReaderVisitor, cleanupVisitor, contentTransformerVisitor, contentGeneratorVisitor } from "./visitors";
import { FSSerNode, TNodeType, TVisitors, Visitor } from "./types";

const defaultOptions = {
  traversalIgnoreFilename: ".serignore",
  defualtDonotTraverseDir: ["**/node_modules/**", "**/.git/**", "**/.gitignore"],
  startVisitors: [contentReaderVisitor(), contentTransformerVisitor()] as TVisitors[],
  endVisitors: [cleanupVisitor(["content", "isRoot", "mdxfiles"])] as TVisitors[],
};


export interface FSSerialized {
  version: 1;
  tree: FSSerNode;
}

export interface FSSerializationOptions {
  /**
    * Absolute path to the dir in FS from where the serialization starts.
    */
  serStartsFromAbsDir: string;
  /**
    * Output file path where the serialized fs would be written in json format.
    * If this is not present then it's not written in a file, the content is simply returned to the caller.
    */
  outputFilePath: string;
  /**
    * List of all dirs that are not be traversed while serializing the FS. By default `**\/node_modules\/**` and `**\/.git\/**` are not
    * traversed. Entries are glob pattern.
    *
    */
  donotTraverseList?: string[];

  /**
    * Pass a visitor object (visitor pattern) to be add informtion to `FSSerNode`.
    * Since this is file system serialization this visitor object can't create or delete new node (we don't write to fs during this phase).
    * It can only attach new information to the existing nodes.
    * 
    * The key of the {@link TVisitors} object is to attach a visitor to a particular node.
    * Like key could be any combination of value from {@link TNodeType}
    *   - `dir` to attach a visitor to all dir nodes
    *   - `file` to attach a visitor to all file nodes
    *   - `file|dir` to attach a visitor to all file & dir nodes
    *   - `file[ext=.mdx]` to attach a visitor to all mdx files
    *   - `file[ext=.mdx | ext=.md]` to attach a visitor to all md and mdx files
    *   - `file[ext=.mdx | ext=.md]|dir` to attach a visitor to all md and mdx files and dirs
    * *Only `ext` is filtering is alllowed*
    * 
    * Visitors are executed from left to right
    * In order to ensure order, visitors might implement blocking ops (fs, net etc);
    */
  visitors?: TVisitors[];
}

function checkGlobMatch(path: string, patterns: string[]): boolean {
  let match = false;
  for (const pattern of patterns) {
    match = match || minimatch(path, pattern);
    if (match) break;
  }
  return match;
}

async function getRepresentation(opts: {
  ignoreList: string[],
  warns: string[]
}, currentDir: string, name: string, isRoot = true): Promise<FSSerNode | null> {
  const path = resolve(currentDir, name);
  try {
    const stat = await lstat(path);
    const nPath = path + (stat.isDirectory() ? "/" : "");

    if (checkGlobMatch(nPath, opts.ignoreList)) return null;

    if (stat.isDirectory()) {
      // list all files & dirs inside
      const files = await readdir(path);
      const children: FSSerNode[] = [];
      for (const file of files) {
        const rep = await getRepresentation(opts, path, file, false);
        if (!rep) continue;
        children.push(rep);
      }
      return {
        nodeType: "dir",
        nodeName: name,
        absPath: nPath,
        children,
        isRoot
      };
    } else if (stat.isFile()) {
      return {
        nodeType: "file",
        nodeName: name,
        absPath: nPath,
        ext: extname(name),
      };
    } 
    opts.warns.push(`${path} is neither file or dir. Ignoring.`);
    return null;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      opts.warns.push(`${path} does not exist. Ignoring.`);
    } else {
      opts.warns.push(`Can't get stats from ${path}. Error: ${(e as Error).message}. Ignoring.`);
    }
    return null;
  }
}

// WARN Does not throw any error for illegal filter
export function parseFilterStr(filter: string) {
  // file[ext=.md] <= the condition inside square brackets is called filter2
  // file <= filter1
  const groupedFilters: Record<string, Record<string, string[]>> = {};
  let filter1: [number, number] = [0, 0];
  let filter2: [number, number] = [-1, -1];
  let filter1Name;
  let filter2Expr;
  for (let i = 0; i < filter.length; i++) {
    const ch = filter.charAt(i);

    if (filter2[0] === -1) filter1[1] = i;
    else filter2[1] = i;

    if (ch === "[") {
      filter2 = [i, i];
      filter1Name = filter.substring(...filter1);
      if (filter1Name) groupedFilters[filter1Name] = {};
    } else if (ch === "]") {
      filter2Expr = filter.substring(...[filter2[0] + 1, filter2[1]]);
      if (filter2Expr) {
        const exprs = filter2Expr.split("|");
        const f = groupedFilters[filter1Name];
        if (f) {
          for (const exp of exprs) {
            const [prop, propVal] = exp.split("=");
            if (prop in f) f[prop].push(propVal);
            else f[prop] = [propVal];
          }
        }
      };
      filter2 = [-1, -1];
      filter1 = [i + 1, i + 1];
    } else if (ch === "|") {
      if (filter2[0] === -1) {
        filter1Name = filter.substring(...filter1);
        if (filter1Name && filter1Name !== "|") groupedFilters[filter1Name] = {};
        filter1 = [i + 1, i + 1];
      } 
    } 
  }

  filter1Name = filter.substring(filter1[0], filter.length);
  if (filter1Name) groupedFilters[filter1Name] = {};
  return groupedFilters;
}

type TGroupedVisitors = Record<TNodeType, Record<string, Visitor[]>>;

async function traverse(node: FSSerNode, visitors: TGroupedVisitors, state: Record<string, any> = {}) {
  const starVisitors = visitors[node.nodeType]["*"] || [];
  let l2Visitor: Visitor[] = [];
  if (node.nodeType === "file" && node.ext) {
    l2Visitor = visitors[node.nodeType][node.ext] || [];
  }
  const allVisitors = [...l2Visitor, ...starVisitors,];

  for (const v of allVisitors) {
    await (v.enter ? v.enter(node, state) : Promise.resolve());
  }

  if (node.children) {
    for (const child of node.children) {
      await traverse(child, visitors, { ...state });
    }
  }

  for (const v of allVisitors) {
    await (v.exit ? v.exit(node, state) : Promise.resolve());
  }
}

async function visit(root: FSSerNode, visitors: TVisitors[]) {
  const groupVisitors: TGroupedVisitors = {
    file: {},
    dir: {}
  };

  for (const visitor of visitors) {
    for (const [filter, visitorDefinition] of Object.entries(visitor)) {
      const parsedFilter = parseFilterStr(filter);
      for (const [nodeType, l2Filters] of Object.entries(parsedFilter)) {
        switch (nodeType) {
        case "dir":
        case "file": {
          const grp = groupVisitors[nodeType];
          let exts: string[];
          if (!Object.keys(l2Filters).length) exts = ["*"];
          else exts = l2Filters.ext || [];

          for (const ext of exts) {
            if (ext in grp) grp[ext].push(visitorDefinition);
            else grp[ext] = [visitorDefinition];
          }
          break;
        }

        default:
          break;
        }
      }
    }
  }

  await traverse(root, groupVisitors);
}

/**
  * Terminology
  * - FS: File System
  * - ser: Serialization
  *
  * Starts from `opts.serStartsFromDir` path and serialize the FS hierarchy by traversing the FS
  * recursively. FS is serialized as object of type {@link FSSerNode} for each file/dir that is encountered during traversal.
  * The final content is either written to a file if `opts.outputFilePath` is passed or is simply returned to the caller.
  * Serialization does not read the content of the file, it simply traverse the dirs and files.
  */
export default async function serialize(options: FSSerializationOptions): Promise<FSSerialized> {
  const opts = {
    ...options,
    ...defaultOptions
  };
  opts.donotTraverseList = (opts.donotTraverseList || []).concat(opts.defualtDonotTraverseDir);
  opts.visitors = [
    ...opts.startVisitors,
    ...(process.env.NODE_ENV === "test" ? [] : [contentGeneratorVisitor(opts.outputFilePath)]),
    ...(opts.visitors || []),
    ...opts.endVisitors
  ];

  const warns: string[] = [];
  const name = basename(opts.serStartsFromAbsDir);
  const pathToFile = dirname(opts.serStartsFromAbsDir);

  const tree = await getRepresentation({
    ignoreList: opts.donotTraverseList,
    warns,
  }, pathToFile, name);

  await visit(tree, opts.visitors);

  const manifest: FSSerialized = {
    version: 1,
    tree
  };

  await writeFile(`${options.outputFilePath}/manifest.json`, JSON.stringify(manifest, null, 2));

  return manifest;
}
