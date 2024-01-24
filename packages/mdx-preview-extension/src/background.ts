import { getActiveTab, injectScripts, isGithubMdxPage } from "./utils";

function injectScript(tabId: number, url: string) {
  const isGithubPage = isGithubMdxPage(url);
  if (isGithubPage.isValid) {
    injectScripts();
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["content.js"],
      }
    );
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url && changeInfo.status ==='complete') {
    injectScript(tabId, activeTab.url);
  }
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url) {
    injectScript(activeInfo.tabId, activeTab.url);
  }
});