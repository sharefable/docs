import { Msg } from "@fable-doc/common/dist/cjs/types";
import { GithubRepoData, ImportPath } from "./types";
import { createRootCssContent } from "@fable-doc/common/dist/cjs/theme";

const NEW_ELEMENT_ID = "fable-preview-mjs";
export const GITHUB_EDIT_TAB_SELECTOR = "div.cm-content";
const EMBED_IFRAME_ID = "fable-embed-iframe";
const IFRAME_URL = "http://localhost:5173/";
const githubMDXPageRegex = /github\.com\/.*\/edit\/.*\.mdx$/;
const githubBlobPageRegex = /github\.com\/.*\/blob\/.*\.mdx$/;
const githubEditsPageRegex = /github\.com\/([^\/]+)\/([^\/]+)\/(edit|blob)\/([^\/]+)\/(.+)/;

let contentImportPaths: ImportPath[] = [];
let repoFolderName: null | string = null;
let initialDivWidth = 140;

export const isGithubMdxPage = (url: string): { isValid: boolean, message: string, isEditPage: boolean } => {

  if (githubMDXPageRegex.test(url)) {
    return {
      isValid: true,
      isEditPage: true,
      message: "Loading Mdx preview"
    };
  }

  if (githubBlobPageRegex.test(url)) {
    return {
      isValid: true,
      isEditPage: false,
      message: "Loading Mdx preview"
    };
  }

  return {
    isValid: false,
    isEditPage: false,
    message: "This is not a mdx file, open mdx file in github to preview"
  };
};

export const injectPreviewDivFromEdit = async (data: string) => {
  const headingElement = document.querySelector("h1[data-testid=\"screen-reader-heading\"]");
  if (headingElement && headingElement.parentElement) {
    const lastChild = headingElement.parentElement.lastElementChild;
    injectAddPreviewDiv(data, lastChild!);
  }
};

export const injectPreviewDivFromBlob = async (data: string) => {
  const rootParentDiv = document.querySelector("div[data-selector=\"repos-split-pane-content\"]");
  const lastChild = rootParentDiv!.lastElementChild!.lastElementChild;
  await injectAddPreviewDiv(data, lastChild!);

};

const extractImportPaths = (content: string): ImportPath[] => {
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;

  const importPaths = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importedModule = match[1];
    const importedPath = match[2];
    importPaths.push({ content: importedModule, path: importedPath });
  }
  return importPaths;
};

const isImportPathUpdated = (newContentImportPaths: ImportPath[]): boolean => {
  if (contentImportPaths.length !== newContentImportPaths.length) {
    return true;
  }

  for (const newImport of newContentImportPaths) {
    const mathcingPath = contentImportPaths.find((oldImport) => oldImport.path === newImport.path);
    if (!mathcingPath || mathcingPath.content !== newImport.content) return true;
  }

  return false;
};

const dragIframe = (e: MouseEvent) => {
  const movement = e.movementX;
  initialDivWidth = (initialDivWidth + Math.abs(movement));
  const divExist = document.getElementById(NEW_ELEMENT_ID);
  if (divExist) {
    divExist.style.width = `${initialDivWidth}px`;
  }
};

const injectAddPreviewDiv = async (fileContent: string, lastChild: Element) => {
  let newChild = document.getElementById(NEW_ELEMENT_ID);
  if (!newChild) {
    const botData = await getManifestAndConfig();
    contentImportPaths = extractImportPaths(fileContent);

    (lastChild.lastElementChild! as HTMLElement).style.flexBasis = "100%";

    newChild = document.createElement("div");
    newChild.style.flexBasis = "100%";
    newChild.style.display = "flex";
    newChild.style.border = "1px solid rgb(48, 54, 61)";
    newChild.style.borderRadius = "6px";
    newChild.style.backgroundColor = "rgb(13, 17, 23)";
    newChild.style.width = `${initialDivWidth}px`;
    newChild.id = NEW_ELEMENT_ID;

    const draggerDiv = document.createElement("div");
    draggerDiv.style.height = "100%";
    draggerDiv.style.width = "20px";
    draggerDiv.style.backgroundColor = "black";
    draggerDiv.style.border = "1px solid #aaa";
    draggerDiv.style.cursor = "pointer";
    draggerDiv.addEventListener("mousemove", dragIframe);

    newChild.appendChild(draggerDiv);

    const iframe = document.createElement("iframe");
    iframe.src = IFRAME_URL;
    iframe.height = "100%";
    iframe.width = "inherit";
    iframe.style.flexGrow = "1";
    iframe.style.width = "inherit";
    iframe.id = EMBED_IFRAME_ID;
    newChild!.appendChild(iframe);
    lastChild.appendChild(newChild!);
    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: Msg.CONFIG_DATA, data: botData }, "*");
      iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: fileContent }, "*");
      // when user modifies content before opening preview
      if (isImportPathUpdated(botData.importedFileContents)) {
        handleUpdatedImportedFileContents(fileContent, iframe, contentImportPaths);
      }
    };
  } else {
    const iframe = document.getElementById(EMBED_IFRAME_ID) as HTMLIFrameElement;

    const newContentImportPath = extractImportPaths(fileContent);
    if (isImportPathUpdated(newContentImportPath)) {
      handleUpdatedImportedFileContents(fileContent, iframe, newContentImportPath);
    }
    iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: fileContent }, "*");
  }
};

const handleUpdatedImportedFileContents = async (fileContent: string, iframe: HTMLIFrameElement, newContentImportPath: ImportPath[]) => {
  if (repoFolderName) {
    const importedFileContents = await getImportedFileContents(fileContent);
    iframe.contentWindow?.postMessage({ type: Msg.IMPORTS_DATA, data: { importedFileContents: importedFileContents } }, "*");
    contentImportPaths = newContentImportPath;
  } else {
    // when folder is deleted in github bot call this method to create it again - when user updates the file and tries to relaod but cancel the process
    await getManifestAndConfig();
    contentImportPaths = extractImportPaths(fileContent);
  }
};

const getImportedFileContents = async (fileContent: string) => {
  const repoData = getGithubRepoData();
  const res = await fetch(`${API_URL}/imported-file-content?repoFolderName=${repoFolderName}&relFilePath=${encodeURIComponent(repoData.path)}&content=${encodeURIComponent(fileContent)}&owner=${repoData.owner}&repo=${repoData.repo}&branch=${repoData.branch}`);
  const data = await res.json();
  return data.importedFileContents;
};

const getManifestAndConfig = async () => {
  const githubData = await githubBotApiCall();
  const urlParts = window.location.pathname.split("/");
  const fileName = urlParts.at(-1)!.split(".")[0];
  const resp = { ...githubData, fileName: fileName };
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
  };
  return githubRepoData;
};

const API_URL = "http://localhost:3000";
const githubBotApiCall = async () => {

  const repoData = getGithubRepoData();
  const res = await fetch(`${API_URL}/repo-details?owner=${repoData.owner}&repo=${repoData.repo}&branch=${repoData.branch}&relFilePath=${encodeURIComponent(repoData.path)}`);

  const data = await res.json();
  repoFolderName = data.repoFolderName;
  sendFolderNameToBackground();
  const rootCssData = createRootCssContent(data.config.theme);

  const botData = {
    config: data.config,
    manifest: data.manifest,
    sidePanelLinks: data.sidePanelLinks,
    rootCssData,
    importedFileContents: data.importedFileContents,
    layoutContents: data.layoutContents
  };
  return botData;

};

function sendFolderNameToBackground() {
  chrome.runtime.sendMessage({
    type: Msg.FOLDER_DATA,
    data: {
      folderName: repoFolderName
    }
  });
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tabs && tabs.length >= 1) {
    return tabs[0];
  }

  return null;
}

export async function injectEditorContentScript(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["editorContent.js"],
    world: "MAIN"
  });
}

export async function injectContentScript(tabId: number) {
  await chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"],
    }
  );
}

export async function deleteRepoData(folderName = repoFolderName) {
  if (folderName) {
    const resp = await fetch(`${API_URL}/remove-repo?repoFolderName=${folderName}`, { method: "delete" });
    if (resp.ok) {
      folderName = null;
      contentImportPaths = [];
    }
  }
}