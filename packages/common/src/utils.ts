import { 
  Config, 
  FSSerNode, 
  FSSerialized, 
  FileDetail, 
  LayoutData, 
  SidepanelLinkInfoNode, 
  UrlEntriesMap, 
  UrlMap, 
  UserUrlMapFn 
} from "./types";
import { readFileSync } from "fs";
import * as path from "path";
import defaultConfig from "../static/config";
import { CSSMinifyPlugin } from "./minify";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require("esbuild");

function convertToPascalCase(str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const getRelativePath = (absPath: string, currPath: string) => path.relative(currPath, absPath);

export const getUserConfig = (userConfigFilePath: string): Config => {
  const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");
  
  const moduleExportsData = `module.exports${  userConfigFileContents.split("module.exports").at(-1)}`;
  
  const interpolatedModuleExportsData = replaceCustomComponentVars(moduleExportsData);
  
  const moduleFunction = new Function("module", "exports", interpolatedModuleExportsData);
  const module = { exports: {} };
  moduleFunction(module, module.exports);
  const userConfig = module.exports as Config;
  
  return userConfig;
};

/**
 * 
 * Forming manifest & combined config
 * 
 */
/**
 * @param userConfig used to combine it with default config
 * @param manifest used to add live url path name to every mdx entry
 * @param currPath the path of the project in which we are executing the fable command
 * @returns -> processed Config & Manifest
 */
export const generateManifestAndCombinedConfig = (
  userConfig: Config, 
  manifest: FSSerialized, 
  currPath: string
) => {
  const urlMap = getUrlMap(manifest, userConfig.urlMapping, currPath);
    
  const newManifest = addPathToManifest(manifest, urlMap.entries, urlMap.globalPrefix, currPath);
    
  const combinedConfig = deepMergeObjects(defaultConfig as unknown as Config, userConfig);

  combinedConfig.urlMapping = urlMap;
  
  return {
    config: combinedConfig, manifest: newManifest
  };
};

const addPathToManifest = (manifest: FSSerialized, urlMap: UrlEntriesMap, globalPrefix: string, currPath: string) => {
  const queue: FSSerNode[] = [manifest.tree];
  
  while (queue.length > 0) {
    const node = queue.shift();
  
    if (node!.nodeType === "file" && node!.ext === ".mdx") {
      const absPath = node!.absPath;
      const pathName = getPathNameBasedOnAbsPath(absPath, urlMap, globalPrefix, currPath);
        node!.pathName = pathName;
    }
  
      node!.children?.forEach(child => queue.push(child));
  }
  
  return manifest;
};

const getPathNameBasedOnAbsPath = (
  absPath: string,
  urlMap: UrlEntriesMap,
  globalPrefix: string,
  currPath: string
): string => {
  const relPath = parseFilePath(getRelativePath(absPath, currPath));
  const urlPath = Object.entries(urlMap).find(([livePath, value]) => value.filePath === relPath)![0];
  return `/${globalPrefix}${urlPath === "/" ? "" : urlPath}`;
};

function deepMergeObjects(baseObj: Config, versionObj: Config): Config {
  const mergedObj = { ...baseObj };

  for (const key in versionObj) {
    if (versionObj[key] instanceof Object && key in baseObj && !Array.isArray(versionObj[key])) {
      mergedObj[key] = deepMergeObjects(baseObj[key], versionObj[key]);
    } else {
      mergedObj[key] = versionObj[key];
    }
  }

  return mergedObj;
}

/**
 * 
 * Generating URL map
 * 
 */

export const getUrlMap = (fsSerManifest: FSSerialized, userUrlMap: UrlMap | UserUrlMapFn, currPath: string): UrlMap => {
  if (typeof userUrlMap === "function") userUrlMap = userUrlMap(fsSerManifest);

  const filePaths = getFilePaths(fsSerManifest.tree, currPath);
  const urlMap: UrlEntriesMap = {};

  filePaths.forEach(obj => {
    urlMap[convertFilePathToUrlPath(obj.filePath)] = { filePath: obj.filePath, fileName: obj.fileName, frontmatter: obj.frontmatter, toc: obj.toc };
  });

  const userUrlMapEntries = userUrlMap.entries as unknown as Record<string, string>;

  Object.entries(userUrlMapEntries).forEach(([urlPath, filePath]) => {
    urlMap[convertFilePathToUrlPath(urlPath)] = {
      filePath: parseFilePath(getRelativePath(filePath, currPath)),
      fileName: path.parse(filePath).name,
      frontmatter: {}, // TODO: read frontmatter
      toc: [] // TODO: read toc
    };
  });

  return {
    ...userUrlMap,
    globalPrefix: parseGlobalPrefix(userUrlMap.globalPrefix),
    entries: urlMap,
  };
};

export const getFilePaths = (node: FSSerNode, currPath: string): FileDetail[] => {
  const fileDetails: FileDetail[] = [];

  const traverse = (currentNode: any, currentPath: any) => {
    if (currentNode.nodeType === "file" && currentNode.ext === ".mdx") {
      const fileName = currentNode.nodeName.replace(/\.[^/.]+$/, "");
      const filePath = parseFilePath(getRelativePath(currentNode.absPath, currPath));
      fileDetails.push({ fileName, filePath, frontmatter: currentNode.frontmatter || {}, toc: currentNode.toc });
    }

    if (currentNode.children) {
      for (const childNode of currentNode.children) {
        traverse(childNode, currentPath);
      }
    }
  };

  traverse(node, "");

  return fileDetails;
};

export const parseGlobalPrefix = (str: string): string => {
  let result = str.replace(/^\//, "");
  if (result && result[result.length - 1] !== "/") result = `${result  }/`;
  return result;
};

const parseFilePath = (filePath: string): string => {
  const pathInfo = path.parse(filePath);
  const dirComponents = pathInfo.dir.split(path.sep);
  return !dirComponents[0] ? pathInfo.name : [...dirComponents, pathInfo.name].join("/");
};

const convertFilePathToUrlPath = (path: string): string => {
  const segments = path.split("/");
  const lastSegment = segments[segments.length - 1];

  if (lastSegment === "index") return segments.slice(0, -1).join("/") || "/";
  else if (lastSegment === "") return path.slice(0, -1) || "/";
  else return path;
};

/**
 * 
 * Generate sidepanel links & construct URL tree
 * 
 */
export const constructLinksTree = (fsserNode: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {

  const linksTree: SidepanelLinkInfoNode = {
    ...getFolderLinkInfo(fsserNode, urlMap, currPath),
    url: urlMap.globalPrefix ? `/${urlMap.globalPrefix}` : "/",
  };
  const queue = [{ fsserNode, linksTree }];

  while (queue.length > 0) {
    const { fsserNode, linksTree } = queue.shift()!;

    fsserNode.children?.forEach(node => {
      if (node.nodeType === "dir") {
        const linkInfo = getFolderLinkInfo(node, urlMap, currPath);
        linksTree.children.push(linkInfo);
        queue.push({ fsserNode: node, linksTree: linkInfo });
      }
      if (node.nodeType === "file" && node.ext === ".mdx" && node.nodeName !== "index.mdx") {
        const linkInfo = getMdxFileLinkInfo(node, urlMap, currPath);
        linksTree.children.push(linkInfo);
      }
    });
  }

  return linksTree;
};

const getFolderLinkInfo = (node: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {
  let info: SidepanelLinkInfoNode;
  const indexFile = node.children?.find((el) => el.nodeName === "index.mdx");
  if (indexFile && indexFile.frontmatter?.urlTitle) {
    info = {
      title: indexFile.frontmatter.urlTitle,
      icon: indexFile.frontmatter.icon || undefined,
      url: getPathFromFile(indexFile.absPath, urlMap, currPath),
      children: [],
    };
  } else {
    info = {
      title: constructLinkNameUsingNodeName(node.nodeName),
      icon: undefined,
      url: undefined,
      children: [],
    };
  }

  return info;
};

const getMdxFileLinkInfo = (node: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {
  return {
    title: node.frontmatter?.urlTitle || constructLinkNameUsingNodeName(node.nodeName),
    icon: node.frontmatter?.icon || undefined,
    url: getPathFromFile(node.absPath, urlMap, currPath),
    children: [],
  };
};

const getPathFromFile = (path: string, urlMap: UrlMap, currPath: string): string => {

  const relPath = parseFilePath(getRelativePath(path, currPath));
  const urlPath = Object.entries(urlMap.entries).find(([routerPath, data]) => {
    return data.filePath === relPath;
  })![0];
  return `/${urlMap.globalPrefix}${urlPath === "/" ? "" : urlPath}`;

};

const constructLinkNameUsingNodeName = (nodeName: string): string => {
  const words = nodeName.split(".mdx")[0].split(/-|\/|\/\//);
  return words.map((word, idx) => {
    if (idx === 0) return word.charAt(0).toUpperCase() + word.slice(1);
    return word;
  }).join(" ");
};    

/**
 * 
 * Component Swapping
 * 
 */

/**
 * @param userConfigFilePath used to to read the file & figure out the imported file paths of custom components
 * @param config used to identify the components to be used
 * @param distLoc the path for bundling the components
 * @param staticLoc the path to read standard components from
 * @param currPath the path of the project in which we are executing the fable command
 */
export const handleComponentSwapping = async (
  userConfigFilePath: string, 
  config: Config, 
  distLoc: string, 
  staticLoc: string,
  currPath: string 
) => {   
  const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");
  const splitData = userConfigFileContents.split("module.exports");

  const standardCompFilePathMap = getStandardCompFilePathMap(staticLoc);
  let compFileMap = { ...standardCompFilePathMap };

  const areImportStatementsPresent = splitData.length === 2 && splitData[0].trim().length;

  if(areImportStatementsPresent) {
    const importStatements = splitData[0];
    const importedCompFilePathMap = extractImports(importStatements, currPath);
    compFileMap = { ...compFileMap, ...importedCompFilePathMap };
  }

  await bundleCustomComponents(config, distLoc, compFileMap);
};
  
export const getStandardCompFilePathMap = (staticLoc: string) => {
  const compFilePathMap = {};
  const standardCompsData = getStandardLayoutData(staticLoc);
  Object.entries(standardCompsData).forEach(([_, data]) => {
    data.forEach(comp => {
      compFilePathMap[comp.name] = comp.folderPath;
    });
  });
  return compFilePathMap;
};  

const extractImports = (fileContents: string, currPath: string): Record<string, string> =>  {
  const importRegex = /import\s+([\w]+)?\s*from\s+["'](.+)["']/g;
  const importsObject: Record<string, string> = {};
  
  let match;
  while ((match = importRegex.exec(fileContents)) !== null) {
    const componentName = match[1] || "default";
    const filePath = match[2];
    importsObject[componentName] = path.resolve(currPath, filePath);
  }
  
  return importsObject;
};


const getComponents = () => ["header", "sidepanel", "footer", "toc"];
const getStandardLayouts = () => ["standard-blog"];

const getStandardLayoutData = (staticFolderPath: string) => {
  const layouts = getStandardLayouts();
  const components = getComponents();

  const data = { layout: [] };
  components.forEach(component => {
    data[component] = [];
  });

  layouts.forEach(layout => {
    const layoutCompName = convertToPascalCase(layout);
    Object.keys(data).forEach(key => {
      const currComp = convertToPascalCase(key);
      let subpath = [];
      if(key === "layout") {
        subpath = ["Layout.js"]; 
      } else {
        subpath = ["components", key, "index.js"];
      }
      data[key].push({
        name: layoutCompName + currComp,
        folderPath: path.join(staticFolderPath, `${layout}-layout`, ...subpath),
      });
    });
  });

  return data;
};

export const bundleCustomComponents = async (config: Config, distLoc: string, importCompFilePathMap: Record<string, string>) => {

  const components= getComponents();
  const data = [{
    name: "layout",
    configPath: ["layout"],
    default: "StandardBlogLayout",
    bundledPath: path.join(distLoc, "src", "layouts", "bundled-layout", "Layout.js"),
  }];

  components.forEach(component => {
    data.push({
      name: component,
      configPath: ["props", component, "customComponent"],
      default: `StandardBlog${convertToPascalCase(component)}`,
      bundledPath: path.join(distLoc, "src", "layouts", "bundled-layout", "components", component, "index.js"),
    });
  });

  await Promise.all(data.map(async (component) => {
    const compName = traverseConfig(config, component.configPath) || component.default;
    const importPath = importCompFilePathMap[compName];
    const bundledPath = component.bundledPath;
    await bundle(importPath, bundledPath);
  }));

};

async function bundle(toBeBundledPath: string, outputFilePath: string) {
  try {
    await esbuild.build({
      entryPoints: [toBeBundledPath],
      bundle: true,
      outfile: outputFilePath,
      format: "esm",
      minify: false,
      loader: { ".js": "jsx", ".css": "copy" },
      external: ["react", "react-router-dom", "../../../../application-context"],
      plugins: [CSSMinifyPlugin]
    });
  } catch (error) {
    process.exit(1);
  }
}

const replaceCustomComponentVars = (content: string): string => {
  const pattern = new RegExp("(layout|customComponent):\\s*([^,\\s]+)", "g");
  
  const res = content.replace(pattern, (match, capturedKeyword, capturedValue) => {
    return `${capturedKeyword}: "${capturedValue}"`;
  });

  return res;
};

const traverseConfig = (config: Config, path: string[]): any => {
  let obj = config;
  path.forEach(key => obj = obj[key]);
  return obj;
};

export const getLayoutContents = (staticLayoutPath: string, distLoc: string): LayoutData[] => {
  const layoutContents = [];

  const components = getComponents();
  components.push("layout");
  for (const key in components) {
    const component = components[key];
    let subpath = [];
    if(component === "layout") {
      subpath = ["Layout.js"]; 
    } else {
      subpath = ["components", component, "index.js"];
    }
    const componentData: LayoutData = {
      moduleName: component,
      content: readFileSync(path.join(distLoc, "src", "layouts", "bundled-layout", ...subpath), "utf-8"),
      filePath: path.join(...subpath)
    };

    layoutContents.push(componentData);
  }
  return layoutContents;
};