import { FSSerialized } from "@fable-doc/fs-ser/dist/esm";
import { FSSerNode } from "@fable-doc/fs-ser/dist/esm/types";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "fs";
import { dirname, join, parse, relative, resolve, sep } from "path";
import { fileURLToPath } from "url";
import defaultConfig from "../static/config"
import { Config, Theme, UrlEntriesMap, UrlMap } from "@fable-doc/common/dist/esm/types"
import { getSidepanelLinks, getUrlMap } from "@fable-doc/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function convertToPascalCase(str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * 
 * Routing, links utils
 * 
 */

const getRelativePath = (absPath: string, currPath: string) => relative(currPath, absPath);

const parseFilePath = (filePath: string): string => {
  const pathInfo = parse(filePath);
  const dirComponents = pathInfo.dir.split(sep);
  return !dirComponents[0] ? pathInfo.name : [...dirComponents, pathInfo.name].join('/')
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
            <Wrapper frontmatter={${JSON.stringify(entry.frontmatter)}}>
              <${convertToPascalCase(entry.filePath)} globalState={globalState} addToGlobalState={addToGlobalState} manifest={manifest} config={config} />
            </Wrapper>
          </Layout>
        }
      />
    `
  });
}

const getPathNameBasedOnAbsPath = (
  absPath: string,
  urlMap: UrlEntriesMap,
  globalPrefix: string
): string => {
  const relPath = parseFilePath(getRelativePath(absPath, resolve()))
  const urlPath = Object.entries(urlMap).find(([livePath, value]) => value.filePath === relPath)![0]
  return `/${globalPrefix}${urlPath === '/' ? '' : urlPath}`
}

const getManifest2 = (manifest: FSSerialized, urlMap: UrlEntriesMap, globalPrefix: string) => {
  const queue: FSSerNode[] = [manifest.tree]

  while (queue.length > 0) {
    const node = queue.shift()

    if (node.nodeType === 'file' && node.ext === '.mdx') {
      const absPath = node.absPath
      const pathName = getPathNameBasedOnAbsPath(absPath, urlMap, globalPrefix)
      node.pathName = pathName
    }

    node.children?.forEach(child => queue.push(child))
  }

  return manifest
}

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === '/' ? '' : urlPath}"`)
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

export const generateSidepanelLinks = (fsSerTeee: FSSerNode, urlMap: UrlMap, outputFile: string) => {
  const sidePanelLinks = getSidepanelLinks(fsSerTeee, urlMap, resolve());
  writeFileSync(outputFile, JSON.stringify(sidePanelLinks, null, 2));
}

/**
 * 
 * Theme utils
 * 
 */

export const generateRootCssFile = (
  outputFile: string,
  theme: Theme,
): void => {
  const rootCssContent = createRootCssContent(theme);
  writeFileSync(outputFile, rootCssContent);
}

export const createRootCssContent = (
  theme: Theme
): string => {
  const propertyToVariableMap = {
    'colors.primary': '--primary-color',
    'colors.textPrimary': '--text-primary-color',
    'colors.textSecondary': '--text-secondary-color',
    'colors.textTertiary': '--text-tertiary-color',
    'colors.backgroundPrimary': '--background-primary-color',
    'colors.backgroundSecondary': '--background-secondary-color',
    'colors.accent': '--accent-color',
    'colors.border': '--border-color',
    'typography.fontSize': '--font-size',
    'typography.fontFamily': '--font-family',
    'typography.lineHeight': '--line-height',
    'typography.h1.margin': '--h1-margin',
    'typography.h1.padding': '--h1-padding',
    'typography.h1.fontSize': '--h1-font-size',
    'typography.h1.fontWeight': '--h1-font-weight',
    'typography.h1.lineHeight': '--h1-line-height',
    'typography.h2.margin': '--h2-margin',
    'typography.h2.padding': '--h2-padding',
    'typography.h2.fontSize': '--h2-font-size',
    'typography.h2.fontWeight': '--h2-font-weight',
    'typography.h2.lineHeight': '--h2-line-height',
    'typography.h3.margin': '--h3-margin',
    'typography.h3.padding': '--h3-padding',
    'typography.h3.fontSize': '--h3-font-size',
    'typography.h3.fontWeight': '--h3-font-weight',
    'typography.h3.lineHeight': '--h3-line-height',
    'typography.h4.margin': '--h4-margin',
    'typography.h4.padding': '--h4-padding',
    'typography.h4.fontSize': '--h4-font-size',
    'typography.h4.fontWeight': '--h4-font-weight',
    'typography.h4.lineHeight': '--h4-line-height',
    'typography.h5.margin': '--h5-margin',
    'typography.h5.padding': '--h5-padding',
    'typography.h5.fontSize': '--h5-font-size',
    'typography.h5.fontWeight': '--h5-font-weight',
    'typography.h5.lineHeight': '--h5-line-height',
    'typography.h6.margin': '--h6-margin',
    'typography.h6.padding': '--h6-padding',
    'typography.h6.fontSize': '--h6-font-size',
    'typography.h6.fontWeight': '--h6-font-weight',
    'typography.h6.lineHeight': '--h6-line-height',
    'typography.p.margin': '--p-margin',
    'typography.p.padding': '--p-padding',
    'typography.p.fontSize': '--p-font-size',
    'typography.p.fontWeight': '--p-font-weight',
    'typography.p.lineHeight': '--p-line-height',
  };

  const cssVariablesContent = Object.entries(propertyToVariableMap)
    .map(([property, variable]) => `${variable}: ${getThemeValue(theme, property)};`)
    .join('\n');

  return `:root {\n${cssVariablesContent}\n}\n`;

  function getThemeValue(theme: Theme, path: string) {
    // @ts-ignore
    return path.split('.').reduce((acc, key) => acc[key], theme);
  }
}


/**
 * 
 * Config utils
 * 
 */

// TODO. use from common util
export const generateUserAndDefaultCombinedConfig = (userConfig: Config, manifest: FSSerialized, currPath: string) => {
  const urlMap = getUrlMap(manifest, userConfig.urlMapping, currPath)
  userConfig.urlMapping = urlMap;

  const newManifest = getManifest2(manifest, urlMap.entries, urlMap.globalPrefix)

  const combinedTheme = mergeObjects(defaultConfig.theme, userConfig.theme) as Theme
  userConfig.theme = combinedTheme;

  return {
    config: userConfig, manifest: newManifest
  };
}


export const writeUserConfigAndManifest = (userConfig: Config, manifest: FSSerialized, outputFile: string, outputManifestFile: string) => {
  writeFileSync(outputFile, JSON.stringify(userConfig, null, 2));
  writeFileSync(outputManifestFile, JSON.stringify(manifest, null, 2));
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

export const copyDirectory = (source: string, destination: string): void => {
  if (!existsSync(destination)) {
    mkdirSync(destination);
  }

  const files = readdirSync(source);

  files.forEach(file => {
    const sourcePath = join(source, file);
    const destinationPath = join(destination, file);

    if (statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      copyFileSync(sourcePath, destinationPath);
    }
  });
};