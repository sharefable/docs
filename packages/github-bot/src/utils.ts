import { existsSync, mkdirSync, readFileSync } from "fs";
import { tmpdir } from "os";
import * as path from "path";

export const getOrCreateTempDir = (folderName: string): string => {
    const tempDir = path.join(tmpdir(), folderName,)

    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }

    return tempDir;
}

/**
 * 
 * To be used from @fable-doc/common directly
 * 
 */

export const defaultConfig = {
    version: "1.0.0",
    urlMapping: {
        globalPrefix: "/",
        entries: {},
    },
    props: {
        header: {
            logo: {
                imageUrl: 'https://sharefable.com/fable-logo.svg',
                title: 'Fable Docs',
            },
            navLinks: {
                alignment: 'center',
                links: [
                    { title: 'Visit Fable', url: 'https://sharefable.com' }
                ]
            }
        },
        sidepanel: {},
        content: {},
        footer: {},
    },
    theme: {
        colors: {
            primary: "#3730a3",
            text: "#1e293b",
            background: "#f3f4f6",
            accent: "#c7d2fe",
            border: "#d1d5db",
        },
        typography: {
            fontSize: 16,
            fontFamily: "sans-serif",
            lineHeight: 1.5,
        },
    }
}
export const getUserConfig = (userConfigFilePath: string): any => {
    const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");

    const moduleFunction = new Function('module', 'exports', userConfigFileContents);
    const module = { exports: {} };
    moduleFunction(module, module.exports);
    const userConfig = module.exports as any;

    return userConfig;
}

export const generateUserAndDefaultCombinedConfig = (userConfig: any, manifest: any, currPath: string) => {
    const urlMap = getUrlMap(manifest, userConfig.urlMapping, currPath)
    userConfig.urlMapping = urlMap;

    const combinedTheme = mergeObjects(defaultConfig.theme, userConfig.theme) as any
    userConfig.theme = combinedTheme;
    return userConfig;
}

export const getUrlMap = (fsSerManifest: any, userUrlMap: any, currPath: string): any => {
    if (typeof userUrlMap === 'function') userUrlMap = userUrlMap(fsSerManifest);

    const filePaths = getFilePaths(fsSerManifest.tree, currPath)
    const urlMap: any = {}

    filePaths.forEach(obj => {
        urlMap[convertFilePathToUrlPath(obj.filePath)] = { filePath: obj.filePath, fileName: obj.fileName }
    })

    const userUrlMapEntries = userUrlMap.entries as unknown as Record<string, string>

    Object.entries(userUrlMapEntries).forEach(([urlPath, filePath]) => {
        urlMap[convertFilePathToUrlPath(urlPath)] = {
            filePath: parseFilePath(getRelativePath(filePath, currPath)),
            fileName: path.parse(filePath).name
        }
    })

    return {
        globalPrefix: parseGlobalPrefix(userUrlMap.globalPrefix),
        entries: urlMap
    }
}

export const getFilePaths = (node: any, currPath: string) => {
    const fileDetails: any[] = [];

    const traverse = (currentNode: any, currentPath: any) => {
        if (currentNode.nodeType === "file" && currentNode.ext === ".mdx") {
            const fileName = currentNode.nodeName.replace(/\.[^/.]+$/, '');
            const filePath = parseFilePath(getRelativePath(currentNode.absPath, currPath));
            fileDetails.push({ fileName, filePath });
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

function mergeObjects(defaultObj: any, userObj: any): any {
    const mergedObj: any = { ...defaultObj };

    for (const key in userObj) {
        if (Object.prototype.hasOwnProperty.call(userObj, key)) {
            if (typeof userObj[key] === 'object' && defaultObj[key] && typeof defaultObj[key] === 'object') {
                mergedObj[key] = mergeObjects(defaultObj[key], userObj[key]);
            } else {
                mergedObj[key] = userObj[key];
            }
        }
    }

    return mergedObj;
}

