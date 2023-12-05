import { FSSerialized } from "@fable-doc/fs-ser/dist/esm";
import { FSSerNode } from "@fable-doc/fs-ser/dist/esm/types";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join, parse, relative, resolve, sep } from "path";
import { FileDetail, UrlEntriesMap, UserUrlMap } from "./types";
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

const getFilePaths = (node: FSSerNode) => {
  const fileDetails: FileDetail[] = [];

  const traverse = (currentNode: FSSerNode, currentPath: string) => {
    if (currentNode.nodeType === "file") {
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
    return `{
            path: "/${globalPrefix}${urlPath === '/' ? '' : urlPath}",
            element: <${convertToPascalCase(entry.filePath)}/>,
          },`;
  });
}

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === '/' ? '' : urlPath}"`)
}

const getUrlMap = (filePaths: FileDetail[], userUrlMap: UserUrlMap): UrlEntriesMap => {
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

  return urlMap
}

export const createRouterContent = (fsSerManifest: FSSerialized, userUrlMap: UserUrlMap) => {
  const filePaths = getFilePaths(fsSerManifest.tree)

  const urlMap = getUrlMap(filePaths, userUrlMap)

  const globalPrefix = parseGlobalPrefix(userUrlMap.globalPrefix)

  const importStatements = getImportStatements(urlMap)

  const routerConfig = getRouterConfig(urlMap, globalPrefix)

  const crawlableRoutes = getCrawlableRoutes(urlMap, globalPrefix)

  const routerTemplate = readFileSync(join(__dirname, 'static', 'router.js'), 'utf-8')

  return routerTemplate
    .replace('<IMPORT_STATEMENTS />', importStatements.join('\n'))
    .replace('<CRAWABLE_ROUTES />', crawlableRoutes.join(','))
    .replace('<ROUTER_CONFIG />', routerConfig.join('\n'))
}

type UserUrlMapFn = (manifest: FSSerialized) => UserUrlMap

export const generateRouterFile = (
  fsSerManifest: FSSerialized,
  outputFile: string,
  userUrlMap: UserUrlMap | UserUrlMapFn
): void => {
  if (typeof userUrlMap === 'function') userUrlMap = userUrlMap(fsSerManifest);
  const routerContent = createRouterContent(fsSerManifest, userUrlMap)
  writeFileSync(outputFile, routerContent);
}
