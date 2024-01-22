import { GithubRepoData, Msg } from "./types";
import { createRootCssContent } from "@fable-doc/common/dist/cjs/theme";

const NEW_ELEMENT_ID = "fable-preview-mjs";
export const GITHUB_EDIT_TAB_SELECTOR = "div.cm-content";
const EMBED_IFRAME_ID = "fable-embed-iframe";
const IFRAME_URL = "http://localhost:5173/";
const githubMDXPageRegex = /github\.com\/.*\/edit\/.*\.mdx$/;
const githubBlobPageRegex = /github\.com\/.*\/blob\/.*\.mdx$/;
const githubEditsPageRegex = /github\.com\/([^\/]+)\/([^\/]+)\/(edit|blob)\/([^\/]+)\/(.+)/;

export const isGithubMdxPage = (url: string): { isValid: boolean, message: string, isEditPage: boolean } => {

  if (githubMDXPageRegex.test(url)) {
    return {
      isValid: true,
      isEditPage: true,
      message: "Loading Mdx preview"
    }
  }

  if (githubBlobPageRegex.test(url)) {
    return {
      isValid: true,
      isEditPage: false,
      message: "Loading Mdx preview"
    }
  }

  return {
    isValid: false,
    isEditPage: false,
    message: "This is not a mdx file, open mdx file in github to preview"
  }
}

export const injectPreviewDivFromEdit = async (data: string) => {
  const headingElement = document.querySelector("h1[data-testid=\"screen-reader-heading\"]");
  if (headingElement && headingElement.parentElement) {
    const lastChild = headingElement.parentElement.lastElementChild;
    injectAddPreviewDiv(data, lastChild!);
  }
}

export const injectPreviewDivFromBlob = async (data: string) => {
  const rootParentDiv = document.querySelector("div[data-selector=\"repos-split-pane-content\"]");
  const lastChild = rootParentDiv!.lastElementChild!.lastElementChild;
  await injectAddPreviewDiv(data, lastChild!)

}

const injectAddPreviewDiv = async (data: string, lastChild: Element) => {
  let newChild = document.getElementById(NEW_ELEMENT_ID)
  if (!newChild) {
    const botData = await getManifestAndConfig();

    (lastChild.lastElementChild! as HTMLElement).style.flexBasis = "100%"

    newChild = document.createElement("div");
    newChild.style.flexBasis = "100%"
    newChild.style.border = "1px solid rgb(48, 54, 61)"
    newChild.style.borderRadius = "6px"
    newChild.style.backgroundColor = "rgb(13, 17, 23)"
    newChild.id = NEW_ELEMENT_ID

    const iframe = document.createElement("iframe");
    iframe.src = IFRAME_URL
    iframe.height = "100%"
    iframe.width = "100%"
    iframe.id = EMBED_IFRAME_ID
    newChild!.appendChild(iframe);
    lastChild.appendChild(newChild!);
    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: Msg.CONFIG_DATA, data: botData }, "*")
      iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: data }, "*")
    }
  } else {
    let iframe = document.getElementById(EMBED_IFRAME_ID) as HTMLIFrameElement;
    iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: data }, "*")
  }
};

const getManifestAndConfig = async () => {
  const resp = await githubBotApiCall();
  return resp;
};

const getGithubRepoData = () => {
  const url = window.location.href;

  const match = url.match(githubEditsPageRegex);
  const githubRepoData: GithubRepoData = {
    owner: match![1],
    repo: match![2],
    branch: match![4],
    path: `./${match![5]}`
  }
  return githubRepoData;
};

const API_URL = "http://localhost:3000";
const githubBotApiCall = async () => {

  const repoData = getGithubRepoData();
  const res = await fetch(`${API_URL}/hello-world?owner=${repoData.owner}&repo=${repoData.repo}&branch=${repoData.branch}&relFilePath=${encodeURIComponent(repoData.path)}`)

  const data = await res.json();

  const rootCssData = createRootCssContent(data.config.theme);

  const botData = {
    config: data.config,
    manifest: data.manifest,
    sidePanelLinks: data.sidePanelLinks,
    rootCssData,
    importedFileContents: data.importedFilesContents,
    layoutContents: data.layoutContents
  };
  return botData;

};
