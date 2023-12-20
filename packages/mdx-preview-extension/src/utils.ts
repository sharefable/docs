import { Msg } from "./types"

const NEW_ELEMENT_ID = 'fable-preview-mjs'
export const GITHUB_EDIT_TAB_SELECTOR = 'div.cm-content'
const EMBED_IFRAME_ID = 'fable-embed-iframe'
const IFRAME_URL = 'http://localhost:5173/'

export const isGithubEditsPage = (url: string): { isValid: boolean, message: string } => {
    const githubEditsPagePattern = /github\.com\/[\w.-]+\/[^/]+\/edit\/[^/]+\/[^/]+\.mdx$/;

    if (!githubEditsPagePattern.test(url)) {
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

const githubBotApiCall = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const botData = {
                config: config,
                manifest: manifest
            }
            resolve(botData);
        }, 2000)
    })
}

const config = `{
    "version": "1.0.0",
    "urlMapping": {
      "globalPrefix": "",
      "entries": {
        "/": {
          "filePath": "index",
          "fileName": "index"
        }
      }
    },
    "props": {
      "header": {
        "logo": {
          "imageUrl": "https://sharefable.com/fable-logo.svg",
          "title": "Fable Docs"
        },
        "navLinks": {
          "alignment": "center",
          "links": [
            {
              "title": "Visit Fable",
              "url": "https://sharefable.com"
            }
          ]
        }
      },
      "sidepanel": {
        "showSidePanel": true
      },
      "content": {},
      "footer": {}
    },
    "theme": {
      "colors": {
        "primary": "#3730a3",
        "textPrimary": "#1e293b",
        "textSecondary": "#ffffff",
        "textTertiary": "#ffffff",
        "backgroundPrimary": "#f3f4f6",
        "backgroundSecondary": "#f3f4f6",
        "accent": "#c7d2fe",
        "border": "#d1d5db",
        "text": "#1e293b",
        "background": "#f3f4f6"
      },
      "typography": {
        "fontSize": 16,
        "fontFamily": "sans-serif",
        "lineHeight": 1.5,
        "h1": {
          "margin": "0 0 24px 0",
          "padding": 0,
          "fontSize": "38px",
          "fontWeight": 700,
          "lineHeight": "48px"
        },
        "h2": {
          "margin": "0 0 32px 0",
          "padding": 0,
          "fontSize": "32px",
          "fontWeight": 600,
          "lineHeight": "36px"
        },
        "h3": {
          "margin": "0 0 32px 0",
          "padding": 0,
          "fontSize": "20px",
          "fontWeight": 600,
          "lineHeight": "26px"
        },
        "h4": {
          "margin": "0 0 24px 0",
          "padding": 0,
          "fontSize": "16px",
          "fontWeight": 600,
          "lineHeight": "22px"
        },
        "h5": {
          "margin": "0 0 24px 0",
          "padding": 0,
          "fontSize": "16px",
          "fontWeight": 600,
          "lineHeight": "22px"
        },
        "h6": {
          "margin": "0 0 24px 0",
          "padding": 0,
          "fontSize": "16px",
          "fontWeight": 600,
          "lineHeight": "22px"
        }
      }
    }
  }`

const manifest = `
  {
    "version": 1,
    "tree": {
      "nodeType": "dir",
      "nodeName": "example",
      "absPath": "/Users/shweta/fable/example/",
      "children": [
        {
          "nodeType": "file",
          "nodeName": "index.mdx",
          "absPath": "/Users/shweta/fable/example/index.mdx",
          "ext": ".mdx",
          "frontmatter": {
            "title": "apple"
          },
          "pathName": "/"
        }
      ]
    }
  }
  `
