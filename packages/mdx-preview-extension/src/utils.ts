import { Msg } from "@fable-doc/common/dist/cjs/types";
import { ElementId, GithubRepoData, ImportPath } from "./types";
import { createRootCssContent } from "@fable-doc/common/dist/cjs/theme";
import { pictureIcon } from "./static/picture-icon";

export const GITHUB_EDIT_TAB_SELECTOR = "div.cm-content";
const IFRAME_URL = "http://localhost:5173/";
const githubMDXPageRegex = /github\.com\/.*\/edit\/.*\.mdx$/;
const githubBlobPageRegex = /github\.com\/.*\/blob\/.*\.mdx$/;
const githubEditsPageRegex = /github\.com\/([^\/]+)\/([^\/]+)\/(edit|blob)\/([^\/]+)\/(.+)/;

let startX = 0;
let contentImportPaths: ImportPath[] = [];
let repoFolderName: null | string = null;
let initialDivWidth = 440;
let isResizing = false;
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

const dragIframe = (e: MouseEvent, containerWidth: number) => {
  if (!isResizing) return;
  const movement = e.movementX;
  const newWidth = initialDivWidth + (-1 * movement);
  const maxWidth = (70 * containerWidth) / 100;

  const divExist = document.getElementById(ElementId.IFARME_CONTAINER);
  if (divExist) {
    initialDivWidth = Math.min(newWidth, maxWidth);
    divExist.style.width = `${initialDivWidth}px`;
  }
};

const injectAddPreviewDiv = async (fileContent: string, lastChild: Element) => {
  let newChild = document.getElementById(ElementId.IFARME_CONTAINER);
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
    newChild.style.flex = "auto";
    newChild.style.position = "relative";
    newChild.style.width = `${initialDivWidth}px`;
    newChild.id = ElementId.IFARME_CONTAINER;

    const draggerDiv = document.createElement("div");
    draggerDiv.style.height = "100%";
    draggerDiv.style.width = "20px";
    draggerDiv.style.backgroundColor = "black";
    draggerDiv.style.border = "1px solid #aaa";
    draggerDiv.style.cursor = "pointer";
    draggerDiv.id = ElementId.DOCDEN_DRAGGER_DIV;
    draggerDiv.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;
      draggerDiv.style.backgroundColor = "#666";
      addOverlayDiv(newChild!);
    });
    document.addEventListener("mousemove", (e) => dragIframe(e, (lastChild as HTMLElement).offsetWidth));
    document.addEventListener("mouseup", resetDrag);

    newChild.appendChild(draggerDiv);

    const iframe = document.createElement("iframe");
    iframe.src = IFRAME_URL;
    iframe.height = "100%";
    iframe.width = "inherit";
    iframe.style.flexGrow = "1";
    iframe.style.width = "inherit";
    iframe.id = ElementId.EMBED_IFRAME;
    newChild!.appendChild(iframe);
    lastChild.appendChild(newChild!);
    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: Msg.CONFIG_DATA, data: botData }, "*");
      iframe.contentWindow?.postMessage({ type: Msg.MDX_DATA, data: fileContent }, "*");
      // when user modifies content before opening preview
      if (botData.importedFileContents.length !== contentImportPaths.length) {
        handleUpdatedImportedFileContents(fileContent, iframe, contentImportPaths);
      }
    };
  } else {
    const iframe = document.getElementById(ElementId.EMBED_IFRAME) as HTMLIFrameElement;

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

const resetDrag = () => {
  const draggerDiv = document.getElementById(ElementId.DOCDEN_DRAGGER_DIV);
  if (draggerDiv) {
    isResizing = false;
    draggerDiv.style.backgroundColor = "black";
    const overlayDiv = document.getElementById(ElementId.DOCDEN_DRAG_OVERLAY_DIV);
    overlayDiv?.remove();
  }
};

const addOverlayDiv = (containerDiv: HTMLElement) => {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.position = "absolute";
  overlayDiv.style.width = "100%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.backgroundColor = "transparent";
  overlayDiv.id = ElementId.DOCDEN_DRAG_OVERLAY_DIV;

  containerDiv.appendChild(overlayDiv);
};

const getS3UploadUrl = async (type: string): Promise<string> => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const res = await fetch(`https://sbapi.sharefable.com/uploadurl?ct=${encodeURIComponent(type)}`, {
    headers,
  });

  const json = await res.json();  

  // @ts-ignore
  return json.url || "";
};

export async function uploadFileToAws(image: File): Promise<string> {
  if (!image) return "";

  const awsSignedUrl = await getS3UploadUrl(image.type);

  if (!awsSignedUrl) return "";

  const imageUrl = await uploadImageAsBinary(image, awsSignedUrl);

  return imageUrl;
}

export const uploadImageAsBinary = async (
  selectedImage: any,
  awsSignedUrl: string
): Promise<string> => {
  const uploadedImageSrc = awsSignedUrl.split("?")[0];

  const reader = new FileReader();
  reader.readAsArrayBuffer(selectedImage);
  return new Promise((resolve) => {
    reader.addEventListener("load", async () => {
      const binaryData = reader.result;
      const res = await fetch(awsSignedUrl, {
        method: "PUT",
        body: binaryData,
        headers: { "Content-Type": selectedImage.type },
      });

      if (res.status === 200) {
        resolve(uploadedImageSrc);
      }
    });
  });
};

const getImageDialogueElements = () => {
  const fablePictureDialogueEl = document.getElementsByClassName("fable-picture-dialogue").item(0) as HTMLElement;
  const fableDialogueMessage = document.getElementById("fable-dialogue-message") as HTMLDivElement;
  const fableImageLinkWrapper = document.getElementById("fable-image-link-wrapper") as HTMLDivElement;
  const fableImageLink = document.getElementsByClassName("fable-image-link").item(0) as HTMLDivElement;
  const clipboardCopy = document.getElementsByTagName("clipboard-copy").item(0);
  const fableDialogueCloseBtn = document.getElementById("fable-dialogue-close-btn") as HTMLDivElement;
  const uploadBtn = document.getElementsByClassName("fable-picture-icon").item(0) as HTMLInputElement;

  return { 
    fableDialogueCloseBtn, 
    fableDialogueMessage, 
    fableImageLink, 
    fableImageLinkWrapper, 
    fablePictureDialogueEl, 
    clipboardCopy, 
    uploadBtn 
  };
};

const resetImageDialogue = (imageDialogueElements: ReturnType<typeof getImageDialogueElements>) => {
  imageDialogueElements.fablePictureDialogueEl.style.opacity = "0";
  imageDialogueElements.clipboardCopy?.setAttribute("value", "");
  imageDialogueElements.fableImageLink.innerText = "";
  imageDialogueElements.fableDialogueMessage.innerText = "Uploading image...";
  imageDialogueElements.fablePictureDialogueEl.style.transform = "translate(-40%, -175%)";
  imageDialogueElements.fableImageLinkWrapper.style.display = "none";
  imageDialogueElements.fableDialogueCloseBtn.style.display = "none";
};

export const imageUploadHandler = async (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.files?.length) {
    const imageDialogueElements = getImageDialogueElements();
    resetImageDialogue(imageDialogueElements);
    
    imageDialogueElements.fablePictureDialogueEl.style.opacity = "1";

    const fileUrl = await uploadFileToAws(target.files.item(0)!);

    const imgTag = getImgTag(fileUrl);
    navigator.clipboard.writeText(imgTag);

    imageDialogueElements.clipboardCopy?.setAttribute("value", imgTag);
    imageDialogueElements.fableDialogueCloseBtn.style.display = "block";
    imageDialogueElements.fablePictureDialogueEl.style.transform = "translate(-40%, -140%)";
    imageDialogueElements.fableDialogueMessage.innerText = "Link to uploaded image copied to clipboard!";
    imageDialogueElements.fableImageLink.innerText = imgTag;
    imageDialogueElements.fableImageLinkWrapper.style.display = "flex";
    imageDialogueElements.uploadBtn.value = "";
    
    imageDialogueElements.fableDialogueCloseBtn.addEventListener("click", () => {
      resetImageDialogue(imageDialogueElements);
    });
  }
};

export const getImgTag = (src: string) => {
  return `<img alt="..." src="${src}"></img>`;
};

export const insertImageOption = (): void => {
  const MAX_POLL_ITERATIONS = 20;
  let pollIterations = 0;

  const intervalId = setInterval(() => {
    const destinationDiv = document.querySelector(".segmentedControl-content")
      ?.parentElement
      ?.parentElement
      ?.parentElement;

    pollIterations++;

    if (destinationDiv || pollIterations > MAX_POLL_ITERATIONS) clearInterval(intervalId);

    if (destinationDiv && !document.getElementById("fable-image-upload-btn")) {
      destinationDiv.insertAdjacentHTML("afterend", pictureIcon);

      const uploadBtn = document.getElementsByClassName("fable-picture-icon").item(0);
      uploadBtn?.addEventListener("input", imageUploadHandler);
    }
  }, 100);
};