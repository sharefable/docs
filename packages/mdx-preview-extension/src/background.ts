import { Msg } from "@fable-doc/common/dist/cjs/types";
import { getActiveTab, injectEditorContentScript, injectContentScript, isGithubMdxPage, deleteRepoData } from "./utils";

let repoFolderName: null | string = null;

async function injectScriptsIntoTab(tabId: number, url: string) {
  const isGithubPage = isGithubMdxPage(url);
  if (isGithubPage.isValid) {
    await injectEditorContentScript(tabId);
    await injectContentScript(tabId);
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url && changeInfo.status === "complete") {
    await injectScriptsIntoTab(tabId, activeTab.url);
    if(repoFolderName){
      await deleteRepoData(repoFolderName);
      repoFolderName = null;
    }
  }
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url) {
    await injectScriptsIntoTab(activeInfo.tabId, activeTab.url);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, senderResponse){
  if(request.type === Msg.FOLDER_DATA){
    repoFolderName = request.data.folderName;
  }
});
