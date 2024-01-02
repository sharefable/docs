import { GithubRepoData, Msg } from "./types"
import {createRootCssContent} from "@fable-doc/common/dist/cjs/static-file-gen-utils";

const NEW_ELEMENT_ID = 'fable-preview-mjs'
export const GITHUB_EDIT_TAB_SELECTOR = 'div.cm-content'
const EMBED_IFRAME_ID = 'fable-embed-iframe'
const IFRAME_URL = 'http://localhost:5173/'
const githubMDXPageRegex = /github\.com\/.*\/edit\/.*\.mdx$/;
const githubEditsPageRegex = /github\.com\/([^\/]+)\/([^\/]+)\/edit\/([^\/]+)\/(.+)/;

export const isGithubEditsPage = (url: string): { isValid: boolean, message: string } => {

    if (!githubMDXPageRegex.test(url)) {
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

const getGithubRepoData = ()=>{
  const url = window.location.href

  const match = url.match(githubEditsPageRegex)
  const githubRepoData : GithubRepoData = {
    owner: match![1],
    repo: match![2],
    branch: match![3],
    path: './'+match![4]
  }
  return githubRepoData;
}

const API_URL = "http://localhost:3000"
const githubBotApiCall = async () => {

  const repoData = getGithubRepoData();

  const res = await fetch(`${API_URL}/hello-world?owner=${repoData.owner}&repo=${repoData.repo}&branch=${repoData.branch}&relFilePath=${encodeURIComponent(repoData.path)}`)

  const data = await res.json();

  const rootCssData = createRootCssContent(data.config.theme)

  const botData = {
    config: data.config,
    manifest: data.manifest,
    sidePanelLinks: data.sidePanelLinks,
    rootCssData,
    importedFileContents: data.importedFilesContents,
  }
  return botData;

}
