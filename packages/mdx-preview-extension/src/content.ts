import { Msg } from "./types";
import {
  GITHUB_EDIT_TAB_SELECTOR,
  getTextContentWithFormatting,
  injectAddPreviewDiv,
  insertImageOption,
  isGithubEditsPage
} from "./utils";

insertImageOption();

let timeoutId: NodeJS.Timeout;
const processPage = async () => {
  const isGithubPage = isGithubEditsPage(window.location.href);
  if (isGithubPage.isValid) {
    const observer = new MutationObserver(handleContentUpdate);
    const observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    };
    const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR);
    observer.observe(sourceDiv!, observerConfig);
    injectAddPreviewDiv(getTextContentWithFormatting(sourceDiv));
  }else{
    await chrome.runtime.sendMessage({ type: Msg.INVALID_PAGE, message: isGithubPage.message });
  }
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === Msg.EXTENSION_ACTIVATED) {
    processPage();
  }
});

const handleContentUpdate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(()=>{
      const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR);
      injectAddPreviewDiv(getTextContentWithFormatting(sourceDiv));
    }, 1000);
  });
};

export { };
