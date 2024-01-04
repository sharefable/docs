import { Config, FSSerNode, FSSerialized, FileDetail, SidepanelLinkInfoNode, Theme, UrlEntriesMap, UrlMap, UserUrlMapFn } from "./types";
import { readFileSync } from "fs";
import * as path from "path";
import defaultConfig from '../static/config'
const esbuild = require('esbuild');

const getPathNameBasedOnAbsPath = (
    absPath: string,
    urlMap: UrlEntriesMap,
    globalPrefix: string,
    currPath: string
  ): string => {
    const relPath = parseFilePath(getRelativePath(absPath, currPath))
    const urlPath = Object.entries(urlMap).find(([livePath, value]) => value.filePath === relPath)![0]
    return `/${globalPrefix}${urlPath === '/' ? '' : urlPath}`
  }
  
  const getManifest2 = (manifest: FSSerialized, urlMap: UrlEntriesMap, globalPrefix: string, currPath: string) => {
    const queue: FSSerNode[] = [manifest.tree]
  
    while (queue.length > 0) {
      const node = queue.shift()
  
      if (node!.nodeType === 'file' && node!.ext === '.mdx') {
        const absPath = node!.absPath
        const pathName = getPathNameBasedOnAbsPath(absPath, urlMap, globalPrefix, currPath)
        node!.pathName = pathName
      }
  
      node!.children?.forEach(child => queue.push(child))
    }
  
    return manifest
  }
  

export const getUserConfig = (userConfigFilePath: string): Config => {
    const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");
  
    const moduleExportsData = "module.exports" + userConfigFileContents.split("module.exports").at(-1);
  
    const interpolatedModuleExportsData = replaceCustomComponentVars(moduleExportsData);
  
    const moduleFunction = new Function('module', 'exports', interpolatedModuleExportsData);
    const module = { exports: {} };
    moduleFunction(module, module.exports);
    const userConfig = module.exports as Config;
  
    return userConfig;
}

const replaceCustomComponentVars = (content: string): string => {
    const pattern = new RegExp(`(layout|customComponent):\\s*([^,\\s]+)`, 'g');
    let componentName: string;
  
    const res = content.replace(pattern, (match, capturedKeyword, capturedValue) => {
      if(capturedValue === `"default"`) {
        componentName = "default";
        return `${capturedKeyword}: "default"`;
      }
  
      componentName = capturedValue;
      return `${capturedKeyword}: "${capturedValue}"`;
    });
  
    return res
}

export const handleComponentSwapping = (userConfigFilePath: string, config: Config, distLoc: string ) => {
    const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");
  
    const splitData = userConfigFileContents.split("module.exports");
  
    // if there are import statements then do custom handling
    if(splitData.length === 2 && splitData[0].trim().length) { 
      const importStatements = splitData[0];
      const importCompFilePathMap = extractImports(importStatements);
        
      // layout swapping
      const layoutComp = config.layout
      if(layoutComp && config.layout !== "default") {
        const importCompPath = path.resolve(importCompFilePathMap[layoutComp]); 
        const defaultFilePath = path.join(distLoc, 'src', 'Layout.js')
        bundle(importCompPath, defaultFilePath)
      }
  
      // header swapping
      const headerCustomComp = config.props?.header?.customComponent
      if(headerCustomComp && headerCustomComp !== "default") {
        const importCompPath = path.resolve(importCompFilePathMap[headerCustomComp]); 
        const defaultFilePath = path.join(distLoc, 'src', 'components', 'header', 'index.js')
        bundle(importCompPath, defaultFilePath)
      }
  
      // sidepanel swapping
      const sidepanelCustomComp = config.props?.sidepanel?.customComponent
      if(sidepanelCustomComp && sidepanelCustomComp !== "default") {
        const importCompPath = path.resolve(importCompFilePathMap[sidepanelCustomComp]); 
        const defaultFilePath = path.join(distLoc, 'src', 'components', 'sidepanel', 'index.js')
        bundle(importCompPath, defaultFilePath)
      }
    }
  }
  
const extractImports = (fileContents: string): Record<string, string> =>  {
    const importRegex = /import\s+([\w]+)?\s*from\s+["'](.+)["']/g;
    const importsObject: Record<string, string> = {};
  
    let match;
    while ((match = importRegex.exec(fileContents)) !== null) {
      const componentName = match[1] || 'default';
      const filePath = match[2];
      importsObject[componentName] = filePath;
    }
  
    return importsObject;
}
  
async function bundle(toBeBundledPath: string, outputFilePath: string) {
    try {
      await esbuild.build({
        entryPoints: [toBeBundledPath],
        bundle: true,
        outfile: outputFilePath,
        format: 'esm',
        minify: false,
        loader: { '.js': 'jsx', '.css': 'copy' },
        external: ["react"],
      });
    } catch (error) {
      process.exit(1);
    }
  }

export const generateUserAndDefaultCombinedConfig = (userConfig: Config, manifest: FSSerialized, currPath: string) => {
    const urlMap = getUrlMap(manifest, userConfig.urlMapping, currPath)
    userConfig.urlMapping = urlMap;
  
    const newManifest = getManifest2(manifest, urlMap.entries, urlMap.globalPrefix, currPath)
  
    const combinedTheme = mergeObjects(defaultConfig.theme, userConfig.theme) as Theme
    userConfig.theme = combinedTheme;
  
    return {
      config: userConfig, manifest: newManifest
    };
  }

export const getUrlMap = (fsSerManifest: FSSerialized, userUrlMap: UrlMap | UserUrlMapFn, currPath: string): UrlMap => {
    if (typeof userUrlMap === 'function') userUrlMap = userUrlMap(fsSerManifest);

    const filePaths = getFilePaths(fsSerManifest.tree, currPath)
    const urlMap: any = {}

    filePaths.forEach(obj => {
        urlMap[convertFilePathToUrlPath(obj.filePath)] = { filePath: obj.filePath, fileName: obj.fileName, frontmatter: obj.frontmatter }
    })

    const userUrlMapEntries = userUrlMap.entries as unknown as Record<string, string>

    Object.entries(userUrlMapEntries).forEach(([urlPath, filePath]) => {
        urlMap[convertFilePathToUrlPath(urlPath)] = {
            filePath: parseFilePath(getRelativePath(filePath, currPath)),
            fileName: path.parse(filePath).name,
            frontmatter: {} // TODO: read frontmatter
        }
    })

    return {
        globalPrefix: parseGlobalPrefix(userUrlMap.globalPrefix),
        entries: urlMap
    }
}

export const getFilePaths = (node: FSSerNode, currPath: string): FileDetail[] => {
    const fileDetails: FileDetail[] = [];

    const traverse = (currentNode: any, currentPath: any) => {
        if (currentNode.nodeType === "file" && currentNode.ext === ".mdx") {
            const fileName = currentNode.nodeName.replace(/\.[^/.]+$/, '');
            const filePath = parseFilePath(getRelativePath(currentNode.absPath, currPath));
            fileDetails.push({ fileName, filePath, frontmatter: currentNode.frontmatter || {} });
        }

        if (currentNode.children) {
            for (const childNode of currentNode.children) {
                traverse(childNode, currentPath);
            }
        }
    };

    traverse(node, '');

    return fileDetails;
};

function parseGlobalPrefix(str: string): string {
    let result = str.replace(/^\//, '');
    if (result && result[result.length - 1] !== '/') result = result + '/'
    return result;
}

const getRelativePath = (absPath: string, currPath: string) => path.relative(currPath, absPath);

const parseFilePath = (filePath: string): string => {
    const pathInfo = path.parse(filePath);
    const dirComponents = pathInfo.dir.split(path.sep);
    return !dirComponents[0] ? pathInfo.name : [...dirComponents, pathInfo.name].join('/')
}

const convertFilePathToUrlPath = (path: string): string => {
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'index') return segments.slice(0, -1).join('/') || '/';
    else if (lastSegment === '') return path.slice(0, -1) || '/';
    else return path;
}

function mergeObjects<T extends Theme>(defaultObj: T, userObj: T): T {
    const mergedObj: T = { ...defaultObj };

    for (const key in userObj) {
        if (Object.prototype.hasOwnProperty.call(userObj, key)) {
            if (typeof userObj[key] === 'object' && defaultObj[key] && typeof defaultObj[key] === 'object') {
                mergedObj[key] = mergeObjects(defaultObj[key] as T, userObj[key] as T) as T[Extract<keyof T, string>];
            } else {
                mergedObj[key] = userObj[key];
            }
        }
    }

    return mergedObj;
}

export const getSidepanelLinks = (fsserNode: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {

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
                queue.push({ fsserNode: node, linksTree: linkInfo })
            }
            if (node.nodeType === "file" && node.ext === ".mdx" && node.nodeName !== "index.mdx") {
                const linkInfo = getMdxFileLinkInfo(node, urlMap, currPath);
                linksTree.children.push(linkInfo);
            }
        })
    }

    return linksTree;
}

const getFolderLinkInfo = (node: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {
    let info: SidepanelLinkInfoNode;
    const indexFile = node.children?.find((el) => el.nodeName === "index.mdx")!;
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
        }
    }

    return info;
}

const getMdxFileLinkInfo = (node: FSSerNode, urlMap: UrlMap, currPath: string): SidepanelLinkInfoNode => {
    return {
        title: node.frontmatter?.urlTitle || constructLinkNameUsingNodeName(node.nodeName),
        icon: node.frontmatter?.icon || undefined,
        url: getPathFromFile(node.absPath, urlMap, currPath),
        children: [],
    }
}

const getPathFromFile = (path: string, urlMap: UrlMap, currPath: string): string => {

    const relPath = parseFilePath(getRelativePath(path, currPath));
    const urlPath = Object.entries(urlMap.entries).find(([routerPath, data]) => {
        return data.filePath === relPath;
    })![0];
    return `/${urlMap.globalPrefix}${urlPath === '/' ? '' : urlPath}`

}

const constructLinkNameUsingNodeName = (nodeName: string): string => {
    const words = nodeName.split(".mdx")[0].split(/-|\/|\/\//);
    return words.map((word, idx) => {
        if (idx === 0) return word.charAt(0).toUpperCase() + word.slice(1);
        return word;
    }).join(" ");
}    
