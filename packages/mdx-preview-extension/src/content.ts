import { Msg } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR, injectPreviewDivFromBlob, injectPreviewDivFromEdit, isGithubMdxPage } from "./utils";

let timeoutId: NodeJS.Timeout;
const processPage = async () => {
  const isGithubPage = isGithubMdxPage(window.location.href)
  if (isGithubPage.isValid && isGithubPage.isEditPage) {
    const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
    sourceDiv!.dispatchEvent(new CustomEvent(Msg.GET_EDITOR_DATA, {
      bubbles: true
    }))

    window.postMessage({ type: Msg.GET_EDITOR_DATA })

    const observer = new MutationObserver(handleContentUpdate)
    const observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    }
    observer.observe(sourceDiv!, observerConfig)
  } else if (isGithubPage.isValid && !isGithubPage.isEditPage) {
    const divId = 'copilot-button-positioner'
    const docDiv = document.getElementById(divId)
    const textAreaContent = docDiv!.querySelector('textarea')!.value
    injectPreviewDivFromBlob(textAreaContent)
  } else {
    await chrome.runtime.sendMessage({ type: Msg.INVALID_PAGE, message: isGithubPage.message });
  }
};

window.addEventListener('message', (event) => {
  if (event.data.type === Msg.EXTENSION_ACTIVATED) {
    processPage()
  } else if (event.data.type === Msg.EDITOR_DATA) {
    injectPreviewDivFromEdit(event.data.data)
  }
});

const handleContentUpdate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      window.postMessage({ type: Msg.GET_EDITOR_DATA })
    }, 1000)
  })
}