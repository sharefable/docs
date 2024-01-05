import { type FSSerialized } from '@fable-doc/fs-ser/dist/esm';
import { type FSSerNode } from '@fable-doc/fs-ser/dist/esm/types';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { type Config, type Theme, type UrlEntriesMap, type UrlMap } from '@fable-doc/common/dist/esm/types';
import { getSidepanelLinks } from '@fable-doc/common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function convertToPascalCase (str: string): string {
  return str.split(/-|\/|\/\//)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

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
        path="/${globalPrefix}${urlPath === '/' ? '' : urlPath}"
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
            >
              <Wrapper frontmatter={${JSON.stringify(entry.frontmatter)}}>
                <${convertToPascalCase(entry.filePath)} 
                    globalState={globalState} 
                    addToGlobalState={addToGlobalState} 
                    manifest={manifest} 
                    config={config} 
                />
              </Wrapper>
          </Layout>
        }
      />
    `;
  });
};

const getCrawlableRoutes = (urlMap: UrlEntriesMap, globalPrefix: string) => {
  return Object.keys(urlMap).map(urlPath => `"/${globalPrefix}${urlPath === '/' ? '' : urlPath}"`);
};

export const createRouterContent = (urlMap: UrlMap) => {
  const globalPrefix = urlMap.globalPrefix;

  const importStatements = getImportStatements(urlMap.entries);

  const routerConfig = getRouterConfig(urlMap.entries, globalPrefix);

  const crawlableRoutes = getCrawlableRoutes(urlMap.entries, globalPrefix);

  const routerTemplate = readFileSync(join(__dirname, 'static', 'router.js'), 'utf-8');

  return routerTemplate
    .replace('<IMPORT_STATEMENTS />', importStatements.join('\n'))
    .replace('<CRAWABLE_ROUTES />', crawlableRoutes.join(','))
    .replace('<ROUTER_CONFIG />', routerConfig.join('\n'));
};

export const generateRouterFile = (
  outputFile: string,
  urlMap: UrlMap
): void => {
  const routerContent = createRouterContent(urlMap);
  writeFileSync(outputFile, routerContent);
};

export const generateSidepanelLinks = (fsSerTeee: FSSerNode, urlMap: UrlMap, outputFile: string) => {
  const sidePanelLinks = getSidepanelLinks(fsSerTeee, urlMap, resolve());
  writeFileSync(outputFile, JSON.stringify(sidePanelLinks, null, 2));
};

/**
 *
 * Theme utils
 *
 */

export const generateRootCssFile = (
  outputFile: string,
  theme: Theme
): void => {
  const rootCssContent = createRootCssContent(theme);
  writeFileSync(outputFile, rootCssContent);
};

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
    'typography.p.lineHeight': '--p-line-height'
  };

  const cssVariablesContent = Object.entries(propertyToVariableMap)
    .map(([property, variable]) => `${variable}: ${getThemeValue(theme, property)};`)
    .join('\n');

  return `:root {\n${cssVariablesContent}\n}\n`;
};

function getThemeValue (theme: Theme, path: string) {
  // @ts-expect-error TODO: give exact reason
  return path.split('.').reduce((acc, key) => acc[key], theme);
}

export const writeUserConfigAndManifest = (
  userConfig: Config,
  manifest: FSSerialized,
  outputFile: string,
  outputManifestFile: string
) => {
  writeFileSync(outputFile, JSON.stringify(userConfig, null, 2));
  writeFileSync(outputManifestFile, JSON.stringify(manifest, null, 2));
};

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
