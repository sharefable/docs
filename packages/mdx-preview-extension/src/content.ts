import { Msg } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR, getTextContentWithFormatting, injectPreviewDivFromBlob, injectPreviewDivFromEdit, isGithubMdxPage } from "./utils";

let timeoutId: NodeJS.Timeout;
const processPage = async () => {
  const isGithubPage = isGithubMdxPage(window.location.href)
  if (isGithubPage.isValid && isGithubPage.isEditPage) {
    const observer = new MutationObserver(handleContentUpdate)
    const observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    }
    const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
    observer.observe(sourceDiv!, observerConfig)
    injectPreviewDivFromEdit(getTextContentWithFormatting(sourceDiv))
  }else if(isGithubPage.isValid && !isGithubPage.isEditPage){
    const divId = 'copilot-button-positioner'
    const docDiv = document.getElementById(divId)
    const textAreaContent = docDiv!.querySelector('textarea')!.value
    injectPreviewDivFromBlob(textAreaContent)
  }else{
    await chrome.runtime.sendMessage({type: Msg.INVALID_PAGE, message: isGithubPage.message});
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === Msg.EXTENSION_ACTIVATED) {
    processPage()
  }
})

const handleContentUpdate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(()=>{
      const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
      injectPreviewDivFromEdit(getTextContentWithFormatting(sourceDiv))
    }, 1000)
  })
}

export { };
