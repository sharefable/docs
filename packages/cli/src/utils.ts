import { FSSerialized } from "@fable-doc/fs-ser/dist/esm";
import { FSSerNode } from "@fable-doc/fs-ser/dist/esm/types";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join, parse, relative, resolve, sep } from "path";
import { Config, FileDetail, UrlEntriesMap, UrlMap } from "./types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseGlobalPrefix(str: string): string {
  let result = str.replace(/^\//, '');
  if (result && result[result.length - 1] !== '/') result = result + '/'
  return result;
}

function convertToPascalCase(str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const getRelativePath = (absPath: string) => relative(resolve(), absPath);

export const getFilePaths = (node: FSSerNode) => {
  const fileDetails: FileDetail[] = [];

  const traverse = (currentNode: FSSerNode, currentPath: string) => {
    if (currentNode.nodeType === "file" && currentNode.ext === ".mdx") {
      const fileName = currentNode.nodeName.replace(/\.[^/.]+$/, '');
      const filePath = parseFilePath(getRelativePath(currentNode.absPath));
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

const parseFilePath = (filePath: string): string => {
  const pathInfo = parse(filePath);
  const dirComponents = pathInfo.dir.split(sep);
  return !dirComponents[0] ? pathInfo.name : [...dirComponents, pathInfo.name].join('/')
}

const convertFilePathToUrlPath = (path: string): string => {
  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];

  if (lastSegment === 'index') return segments.slice(0, -1).join('/') || '/';
  else if (lastSegment === '') return path.slice(0, -1) || '/';
  else return path;
}

const getImportStatements = (urlMap: UrlEntriesMap): string[] => {
  return Object.values(urlMap)
    .filter((value, index, self) => {
      return index === self.findIndex((item) => item.filePath === value.filePath);
    })
    .map(entry => {
      return `const ${convertToPascalCase(entry.filePath)} = lazy(() => import('./mdx-dist/${(entry.filePath)}'));`;
    });
}

const getRouterConfig = (urlMap: UrlEntriesMap, globalPrefix: string): string[] => {
  return Object.entries(urlMap).map(([urlPath, entry]) => {
    return `
    <Route
          path="/${globalPrefix}${urlPath === '/' ? '' : urlPath}"
          element={
            <Layout config={config}>
              <${convertToPascalCase(entry.filePath)} globalState={globalState} addToGlobalState={addToGlobalState} manifest={manifest} />
            </Layout>
          }
        />
    `
  });
}

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === '/' ? '' : urlPath}"`)
}

export const getUrlMap = (fsSerManifest: FSSerialized, userUrlMap: UrlMap | UserUrlMapFn): UrlMap => {
  if (typeof userUrlMap === 'function') userUrlMap = userUrlMap(fsSerManifest);
  
  const filePaths = getFilePaths(fsSerManifest.tree)
  const urlMap: UrlEntriesMap = {}

  filePaths.forEach(obj => {
    urlMap[convertFilePathToUrlPath(obj.filePath)] = { filePath: obj.filePath, fileName: obj.fileName }
  })

  const userUrlMapEntries = userUrlMap.entries as unknown as Record<string, string>

  Object.entries(userUrlMapEntries).forEach(([urlPath, filePath]) => {
    urlMap[convertFilePathToUrlPath(urlPath)] = {
      filePath: parseFilePath(getRelativePath(filePath)),
      fileName: parse(filePath).name
    }
  })

  return {
    globalPrefix:  parseGlobalPrefix(userUrlMap.globalPrefix),
    entries: urlMap
  }
}

export const createRouterContent = (urlMap: UrlMap) => {

  const globalPrefix = urlMap.globalPrefix

  const importStatements = getImportStatements(urlMap.entries)

  const routerConfig = getRouterConfig(urlMap.entries, globalPrefix)

  const crawlableRoutes = getCrawlableRoutes(urlMap.entries, globalPrefix)

  const routerTemplate = readFileSync(join(__dirname, 'static', 'router.js'), 'utf-8')

  return routerTemplate
    .replace('<IMPORT_STATEMENTS />', importStatements.join('\n'))
    .replace('<CRAWABLE_ROUTES />', crawlableRoutes.join(','))
    .replace('<ROUTER_CONFIG />', routerConfig.join('\n'))
}

type UserUrlMapFn = (manifest: FSSerialized) => UrlMap

export const generateRouterFile = (
  outputFile: string,
  urlMap: UrlMap,
): void => {
  const routerContent = createRouterContent(urlMap)
  writeFileSync(outputFile, routerContent);
}

type SidepanelLinkInfoNode = {
  title: string,
  icon?: string,
  url?: string,
  children: SidepanelLinkInfoNode[],
}

export const getSidepanelLinks = (fsserNode: FSSerNode, urlMap: UrlMap): SidepanelLinkInfoNode => {

  const linksTree: SidepanelLinkInfoNode = {
    ...getFolderLinkInfo(fsserNode, urlMap),
    url: urlMap.globalPrefix ? `/${urlMap.globalPrefix}` : "/",
  };
  const queue = [{fsserNode, linksTree}];

  while (queue.length > 0) {
      const {fsserNode, linksTree} = queue.shift();

      fsserNode.children.forEach(node => {
          if(node.nodeType === "dir") {
              const linkInfo = getFolderLinkInfo(node, urlMap);
              linksTree.children.push(linkInfo);
              queue.push({fsserNode: node, linksTree: linkInfo})
          }
          if(node.nodeType === "file" && node.ext === ".mdx" && node.nodeName !== "index.mdx") {
              const linkInfo = getMdxFileLinkInfo(node, urlMap);
              linksTree.children.push(linkInfo);
          }
      })
  }

  return linksTree;
}

const getFolderLinkInfo = (node: FSSerNode, urlMap: UrlMap): SidepanelLinkInfoNode => {
  let info: SidepanelLinkInfoNode;
  const indexFile = node.children.find((el) => el.nodeName === "index.mdx");
  if(indexFile && indexFile.frontmatter?.urlTitle ) {
      info = {
          title: indexFile.frontmatter.urlTitle,
          icon: indexFile.frontmatter.icon || undefined,
          url: getPathFromFile(indexFile.absPath, urlMap),
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

const getMdxFileLinkInfo = (node: FSSerNode, urlMap: UrlMap): SidepanelLinkInfoNode => {
  return {
      title: node.frontmatter.urlTitle || constructLinkNameUsingNodeName(node.nodeName),
      icon: node.frontmatter.icon || undefined,
      url: getPathFromFile(node.absPath, urlMap),
      children: [],
  }
}

const getPathFromFile = (path: string, urlMap: UrlMap): string => {

  const relPath = parseFilePath(getRelativePath(path));
  const urlPath = Object.entries(urlMap.entries).find(([routerPath, data]) => {
    return data.filePath === relPath;
  })![0];
  return `/${urlMap.globalPrefix}${urlPath === '/' ? '' : urlPath}`

}

const constructLinkNameUsingNodeName = (nodeName: string): string => {
  const words = nodeName.split(".mdx")[0].split(/-|\/|\/\//);
  return words.map((word, idx) => {
    if(idx === 0) return word.charAt(0).toUpperCase() + word.slice(1);
    return word;
  }).join(" ");
}

export const generateSidepanelLinks = (fsSerTeee: FSSerNode, urlMap: UrlMap, outputFile: string) => {
  const sidePanelLinks = getSidepanelLinks(fsSerTeee, urlMap);
  writeFileSync(outputFile, JSON.stringify(sidePanelLinks, null, 2));
}

export const generateUserAndDefaultCombinedConfig = (userConfig: Config, manifest: FSSerialized, outputFile: string) => {
  const urlMap = getUrlMap(manifest, userConfig.urlMapping)
  userConfig.urlMapping = urlMap;

  writeFileSync(outputFile, JSON.stringify(userConfig, null, 2));
  return userConfig;
}