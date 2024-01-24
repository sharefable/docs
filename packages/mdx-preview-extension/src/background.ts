import { getActiveTab, injectEditorContentScript, injectContentScript, isGithubMdxPage } from "./utils";

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
  }
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url) {
    await injectScriptsIntoTab(activeInfo.tabId, activeTab.url);
  }
});