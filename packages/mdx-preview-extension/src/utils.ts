import { Msg } from "./types"

const NEW_ELEMENT_ID = 'fable-preview-mjs'
export const GITHUB_EDIT_TAB_SELECTOR = 'div.cm-content'
const EMBED_IFRAME_ID = 'fable-embed-iframe'
const IFRAME_URL = 'http://localhost:5173/'
const githubEditsPageRegex = /github\.com\/([^\/]+)\/([^\/]+)\/edit\/([^\/]+)\/[^/]+\.mdx$/;

export const isGithubEditsPage = (url: string): { isValid: boolean, message: string } => {

    if (!githubEditsPageRegex.test(url)) {
        return {
            isValid: false,
            message: 'This is not a mdx file, open mdx file in github to preview'
        }
    }

    return {
        isValid: true,
        message: 'Loading Mdx preview'
    }
}

export const injectAddPreviewDiv = async (data: string) => {
    const headingElement = document.querySelector('h1[data-testid="screen-reader-heading"]');
    if (headingElement && headingElement.parentElement) {
        const lastChild = headingElement.parentElement.lastElementChild;
        let newChild = document.getElementById(NEW_ELEMENT_ID)

        if (!document.getElementById(NEW_ELEMENT_ID)) {
            const botData = await getManifestAndConfig();
            newChild = document.createElement('div');
            newChild.style.flex = '1'
            newChild.style.border = '1px solid rgb(48, 54, 61)'
            newChild.style.borderRadius = '6px'
            newChild.style.backgroundColor = 'rgb(13, 17, 23)'
            newChild.id = NEW_ELEMENT_ID

            const iframe = document.createElement('iframe');
            iframe.src = IFRAME_URL
            iframe.height = '100%'
            iframe.width = '100%'
            iframe.id = EMBED_IFRAME_ID
            newChild!.appendChild(iframe);
            lastChild!.appendChild(newChild!);
            iframe.onload = () => {
                iframe.contentWindow?.postMessage({ type: Msg.CONFIG_DATA, data: botData}, '*')
                iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: data }, '*')
            }
        } else {
            let iframe = document.getElementById(EMBED_IFRAME_ID) as HTMLIFrameElement;
            iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: data }, '*')
        }
    }
}

export function getTextContentWithFormatting(element: Element | null) {
    if (!element) {
        return ''
    }
    const lines = []
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);

    while (walker.nextNode()) {
        const currentNode = walker.currentNode as Element;
        if (currentNode.classList.contains('cm-line')) {
            lines.push('\n' + currentNode.textContent)
        }
    }

    return lines.join('');
}

const getManifestAndConfig = async () => {
    const resp = await githubBotApiCall()
    return resp
}

const API_URL = "http://localhost:3000"
const githubBotApiCall = async () => {

  const url = window.location.href

  const match = url.match(githubEditsPageRegex)
  const owner = match![1]
  const repo = match![2]
  const branch = match![3]

  const res = await fetch(`${API_URL}/hello-world?owner=${owner}&repo=${repo}&branch=${branch}`)

  const data = await res.json();

  const rootCssData = createRootCssContent(data.config.theme)

  const botData = {
    config: data.config,
    manifest: data.manifest,
    sidePanelLinks: data.sidePanelLinks,
    rootCssData,
  }
  return botData;

}

function createRootCssContent(theme: any): string {
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
      };
    
      const cssVariablesContent = Object.entries(propertyToVariableMap)
        .map(([property, variable]) => `${variable}: ${getThemeValue(theme, property)};`)
        .join('\n');
    
      return `:root {\n${cssVariablesContent}\n}\n`;
    
      function getThemeValue(theme: any, path: string) {
        // @ts-ignore
        return path.split('.').reduce((acc, key) => acc[key], theme);
      }
}