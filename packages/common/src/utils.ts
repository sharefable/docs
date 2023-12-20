import { Config, FSSerNode, FSSerialized, FileDetail, Theme, UrlMap, UserUrlMapFn } from "./types";
import { readFileSync } from "fs";
import * as path from "path";

export const getUserConfig = (userConfigFilePath: string): Config => {
    const userConfigFileContents = readFileSync(userConfigFilePath, "utf8");

    const moduleFunction = new Function('module', 'exports', userConfigFileContents);
    const module = { exports: {} };
    moduleFunction(module, module.exports);
    const userConfig = module.exports as Config;

    return userConfig;
}

export const generateUserAndDefaultCombinedConfig = (userConfig: Config, manifest: FSSerialized, currPath: string): Config => {
    const urlMap = getUrlMap(manifest, userConfig.urlMapping, currPath)
    userConfig.urlMapping = urlMap;

    const combinedTheme = mergeObjects(defaultConfig.theme, userConfig.theme) as any
    userConfig.theme = combinedTheme;
    return userConfig;
}

export const getUrlMap = (fsSerManifest: FSSerialized, userUrlMap: UrlMap | UserUrlMapFn, currPath: string): UrlMap => {
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

export const getFilePaths = (node: FSSerNode, currPath: string): FileDetail[] => {
    const fileDetails: FileDetail[] = [];

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
  

export const defaultConfig: Config = {
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
        sidepanel: {
            showSidePanel: true
        },
        content: {},
        footer: {},
    },
    theme: {
        colors: {
            primary: "#3730a3",
            textPrimary: "#1e293b",
            textSecondary: "#ffffff",
            textTertiary: "#ffffff",
            backgroundPrimary: "#f3f4f6",
            backgroundSecondary: "#f3f4f6",
            accent: "#c7d2fe",
            border: "#d1d5db",
        },
        typography: {
            fontSize: 16,
            fontFamily: "sans-serif",
            lineHeight: 1.5,
            h1: {
                margin: '0 0 24px 0',
                padding: 0,
                fontSize: '38px',
                fontWeight: 700,
                lineHeight: '48px'
            },
            h2: {
                margin: '0 0 32px 0',
                padding: 0,
                fontSize: '32px',
                fontWeight: 600,
                lineHeight: '36px'
            },
            h3: {
                margin: '0 0 32px 0',
                padding: 0,
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '26px'
            },
            h4: {
                margin: '0 0 24px 0',
                padding: 0,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '22px'
            },
            h5: {
                margin: '0 0 24px 0',
                padding: 0,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '22px'
            },
            h6: {
                margin: '0 0 24px 0',
                padding: 0,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '22px'
            }
        },
    }
};