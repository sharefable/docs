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
import { Theme, UrlEntriesMap, UrlMap } from "@fable-doc/common/dist/esm/types";
import { constructLinksTree } from "@fable-doc/common";
import { createRootCssContent } from "@fable-doc/common/dist/esm/theme.js";

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
      return `const ${convertToPascalCase(entry.filePath)} = lazy(() => import('./mdx-dist/${(entry.filePath)}'));`;
    });
};

const getRouterConfig = (urlMap: UrlEntriesMap, globalPrefix: string): string[] => {
  return Object.entries(urlMap).map(([urlPath, entry]) => {
    return `
      <Route
        path="/${globalPrefix}${urlPath === "/" ? "" : urlPath}"
        element={
          <Layout config={config} 
            headerComp={(props) => <Header 
              props={config.props.header} 
              manifest={manifest} 
              config={config} 
              {...props}
              /> 
            }
            sidepanelComp={(props) => <Sidepanel 
              manifest={manifest} 
              config={config} 
              linksTree={sidePanelLinks} 
              {...props}
              />
            }
            footerComp={(props) => <Footer 
              props={config.props.footer}
              {...props}
              />
            }
            tocComp={(props) => <Toc 
              props={config.props.toc}
              toc={${JSON.stringify(entry.toc)}}
              {...props}
              />
            }
            >
              <Wrapper config={config} frontmatter={${JSON.stringify(entry.frontmatter)}}>
                <${convertToPascalCase(entry.filePath)} globalState={globalState} addToGlobalState={addToGlobalState} manifest={manifest} config={config} />
              </Wrapper>
          </Layout>
        }
      />
    `;
  });
};

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === "/" ? "" : urlPath}"`);
};

export const createRouterContent = (urlMap: UrlMap) => {

  const globalPrefix = urlMap.globalPrefix;

  const importStatements = getImportStatements(urlMap.entries);

  const routerConfig = getRouterConfig(urlMap.entries, globalPrefix);

  const crawlableRoutes = getCrawlableRoutes(urlMap.entries, globalPrefix);

  const routerTemplate = readFileSync(join(__dirname, "static", "router.js"), "utf-8");

  return routerTemplate
    .replace("<IMPORT_STATEMENTS />", importStatements.join("\n"))
    .replace("<CRAWABLE_ROUTES />", crawlableRoutes.join(","))
    .replace("<ROUTER_CONFIG />", routerConfig.join("\n"));
};

export const generateRouterFile = (
  outputFile: string,
  urlMap: UrlMap,
): void => {
  const routerContent = createRouterContent(urlMap);
  writeFileSync(outputFile, routerContent);
};

export const generateIndexHtmlFile = (
  outputLoc: string,
  isAnalyticsFilePresent: boolean
): void => {
  const htmlTemplate = readFileSync(join(__dirname, "static", "index.html"), "utf-8");

  const analyticsScript = isAnalyticsFilePresent
    ? "<script src=\"/analytics.js\" defer></script>"
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
