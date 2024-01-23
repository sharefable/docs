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
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { FileDetail, Theme, UrlEntriesMap, UrlMap } from "@fable-doc/common/dist/esm/types";
import { constructLinksTree } from "@fable-doc/common";
import { createRootCssContent } from "@fable-doc/common/dist/esm/theme.js";
import { getComponents } from "@fable-doc/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function convertToPascalCase(str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
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


/**
 * 
 * Routing, links utils
 * 
 */

const getImportStatements = (urlMap: UrlEntriesMap): string[] => {
  return Object.values(urlMap)
    .filter((value, index, self) => {
      return index === self.findIndex((item) => item.filePath === value.filePath);
    })
    .map(entry => {
      return `const ${convertToPascalCase(entry.filePath)} = prerenderedLoadable(() => import('./mdx-dist/${(entry.filePath)}'));`;
    });
};

const getComponentImports = (listOfComponents: string[], dirPaths: string[]): string[] => {
  const componentImports = [];
  for (const dp of dirPaths) {
    for (const component of listOfComponents) {
      componentImports.push(`import ${convertToPascalCase(component)}${convertToPascalCase(dp)} from './layouts/bundled-layout-${convertToPascalCase(dp)}/components/${component}'`);
    }
  }

  return componentImports;
};

const getLayoutImports = (dirPaths: string[]): string[] => {
  const layoutImports = [];
  for (const dp of dirPaths) {
    layoutImports.push(`import Layout${convertToPascalCase(dp)} from './layouts/bundled-layout-${convertToPascalCase(dp)}/Layout'`);
  }

  return layoutImports;
};

const getComponent = (baseComponent: string, dirPaths: string[], entry: FileDetail): string => {
  let matchScore = 0;
  let newComponent: string;

  for (const dirPath of dirPaths) {
    const match = entry.filePath.match(dirPath);
    const matchedPath = match && match[0];
    if (match && match.length && matchedPath.length > matchScore) {
      matchScore = matchedPath.length;
      newComponent = `${baseComponent}${convertToPascalCase(matchedPath)}`;
    }
  }

  return newComponent || baseComponent;
};

const getRouterConfig = (dirPaths: string[], urlMap: UrlEntriesMap, globalPrefix: string): string[] => {
  return Object.entries(urlMap).map(([urlPath, entry]) => {
    return `
      <Route
        path="/${globalPrefix}${urlPath === "/" ? "" : urlPath}"
        element={
          <${getComponent("Layout", dirPaths, entry)} config={config} 
            headerComp={(props) => <${getComponent("Header", dirPaths, entry)} 
              props={config.props.header} 
              manifest={manifest} 
              config={config} 
              {...props}
              /> 
            }
            sidepanelComp={(props) => <${getComponent("Sidepanel", dirPaths, entry)} 
              manifest={manifest} 
              config={config} 
              linksTree={sidePanelLinks} 
              {...props}
              />
            }
            footerComp={(props) => <${getComponent("Footer", dirPaths, entry)} 
              props={config.props.footer}
              {...props}
              />
            }
            tocComp={(props) => <${getComponent("Toc", dirPaths, entry)}
              props={config.props.toc}
              toc={${JSON.stringify(entry.toc)}}
              {...props}
              />
            }
            frontmatter={${JSON.stringify(entry.frontmatter)}}
            toc={${JSON.stringify(entry.toc)}}
          >
              <Wrapper config={config} frontmatter={${JSON.stringify(entry.frontmatter)}}>
                <${convertToPascalCase(entry.filePath)} 
                  globalState={globalState} 
                  addToGlobalState={addToGlobalState} 
                  manifest={manifest} 
                  config={config} 
                  frontmatter={${JSON.stringify(entry.frontmatter)}}
                  toc={${JSON.stringify(entry.toc)}}
                />
              </Wrapper>
          </${getComponent("Layout", dirPaths, entry)}>
        }
      />
    `;
  });
};

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === "/" ? "" : urlPath}"`);
};

const LIST_OF_COMPONENTS = getComponents();

export const createRouterContent = (dirPaths: string[], urlMap: UrlMap) => {

  const globalPrefix = urlMap.globalPrefix;

  const componentImports = getComponentImports(LIST_OF_COMPONENTS, dirPaths);

  const layoutImports = getLayoutImports(dirPaths);

  const importStatements = getImportStatements(urlMap.entries);

  const routerConfig = getRouterConfig(dirPaths, urlMap.entries, globalPrefix);

  const crawlableRoutes = getCrawlableRoutes(urlMap.entries, globalPrefix);

  const routerTemplate = readFileSync(join(__dirname, "static", "router.js"), "utf-8");

  return routerTemplate
    .replace("<LAYOUT_IMPORTS />", layoutImports.join("\n"))
    .replace("<COMPONENT_IMPORTS />", componentImports.join("\n"))
    .replace("<IMPORT_STATEMENTS />", importStatements.join("\n"))
    .replace("<CRAWABLE_ROUTES />", crawlableRoutes.join(","))
    .replace("<ROUTER_CONFIG />", routerConfig.join("\n"));
};

export const generateRouterFile = (
  dirPaths: string[],
  outputFile: string,
  urlMap: UrlMap,
): void => {
  const routerContent = createRouterContent(dirPaths, urlMap);
  writeFileSync(outputFile, routerContent);
};

export const generateIndexHtmlFile = (
  outputLoc: string,
  isAnalyticsFilePresent: boolean,
  globalPrefix: string,
): void => {
  const htmlTemplate = readFileSync(join(__dirname, "static", "index.html"), "utf-8");

  const analyticsScript = isAnalyticsFilePresent
    ? `<script src="/${globalPrefix}analytics.js" defer></script>`
    : "";

  const updatedHtml = htmlTemplate.replace("<ANALYTICS_SCRIPT />", analyticsScript);

  writeFileSync(outputLoc, updatedHtml);
};

/**
 * This utility will create a tree structure encapsulating the links and 
 * their sublinks from the manifest. It stores this tree as a json file 
 * in the userland.
 */
export const getProjectUrlTree = (fsSerTeee: FSSerNode, urlMap: UrlMap, outputFile: string) => {
  const sidePanelLinks = constructLinksTree(fsSerTeee, urlMap, resolve());
  writeFileSync(outputFile, JSON.stringify(sidePanelLinks, null, 2));
};

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
};

export function getDirectoriesInManifest(node: FSSerNode, currentPath = ""): string[] {
  if (!node || node.nodeType !== "dir") return [];

  const fullPath = currentPath === "" ? node.nodeName : `${currentPath}/${node.nodeName}`;
  const foldersArray = [fullPath];

  if (node.children && node.children.length > 0) {
    for (const childNode of node.children) {
      if (childNode.nodeType === "dir") {
        foldersArray.push(...getDirectoriesInManifest(childNode, fullPath));
      }
    }
  }

  return foldersArray;
}

export function getMonoIncNoAsId(): string {
  return (+(`${(+new Date() / 1000) | 0}${Math.random() * (10 ** 8) | 0}`)).toString(16);
}