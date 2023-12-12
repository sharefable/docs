chrome.runtime.onMessage.addListener(async (req)=>{
    if(req.type === "initiateUiUpdate"){
       await initiateUiUpdate()
    }
})

async function initiateUiUpdate() {
    const currentTab = await getActiveTab();
    if (!(currentTab && currentTab.id)) {
        throw new Error("Active tab not found. Are you focused on the browser?");
    }

    if(currentTab.url?.includes('github.com')){
        await chrome.runtime.sendMessage({
            type: 'activated',
            data: 'active'
          });
        await chrome.tabs.sendMessage(currentTab.id, {type: 'activated'})
    }else{
        await chrome.runtime.sendMessage({
            type: 'deactivated',
            data: 'deactive'
          });
    }
} 

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
  
    if (tabs && tabs.length >= 1) {
      return tabs[0];
    }
  
    return null;
}