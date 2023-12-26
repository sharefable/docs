import { Config, FSSerNode, FSSerialized, FileDetail, SidepanelLinkInfoNode, Theme, UrlMap, UserUrlMapFn } from "./types";
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
                margin: '0 0 1.5rem 0',
                padding: 0,
                fontSize: '2.375rem',
                fontWeight: 700,
                lineHeight: '3rem'
            },
            h2: {
                margin: '0 0 2rem 0',
                padding: 0,
                fontSize: '2rem',
                fontWeight: 600,
                lineHeight: '2.25rem'
            },
            h3: {
                margin: '2rem 0 2rem 0',
                padding: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                lineHeight: '1.625rem'
            },
            h4: {
                margin: '0 0 1.5rem 0',
                padding: 0,
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: '1.375rem'
            },
            h5: {
                margin: '0 0 1.5rem 0',
                padding: 0,
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: '1.375rem'
            },
            h6: {
                margin: '0 0 1.5rem 0',
                padding: 0,
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: '1.375rem'
            },
            p: {
                margin: '0 0 1.5rem 0',
                padding: 0,
                fontSize: '1.125rem',
                fontWeight: 400,
                lineHeight: '1.625rem'
            }
        }
    }
};    