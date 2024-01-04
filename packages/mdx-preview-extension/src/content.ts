import { Msg } from "./types";
import { GITHUB_EDIT_TAB_SELECTOR, getTextContentWithFormatting, injectPreviewDivFromBlob, injectPreviewDivFromEdit, isGithubMdxPage } from "./utils";

// window.addEventListener(Msg.EDITOR_DATA, (event)=>{
//   console.log('bhbh', event, 'det', event.detail)
// })


let timeoutId: NodeJS.Timeout;
const processPage = async () => {
  const isGithubPage = isGithubMdxPage(window.location.href)
  if (isGithubPage.isValid && isGithubPage.isEditPage) {
    const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
      sourceDiv!.dispatchEvent(new CustomEvent(Msg.GET_EDITOR_DATA, {
        bubbles: true
      }))

    // post message to inject script and add eventListener to call injectPreviewDivFromEdit
    window.postMessage({type: Msg.GET_EDITOR_DATA})

    const observer = new MutationObserver(handleContentUpdate)
    const observerConfig = {
      characterData: true,
      childList: true,
      subtree: true
    }
    // const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
    observer.observe(sourceDiv!, observerConfig)
    // injectPreviewDivFromEdit(getTextContentWithFormatting(sourceDiv!))

  }else if(isGithubPage.isValid && !isGithubPage.isEditPage){
    const divId = 'copilot-button-positioner'
    const docDiv = document.getElementById(divId)
    const textAreaContent = docDiv!.querySelector('textarea')!.value
    injectPreviewDivFromBlob(textAreaContent)
  }else{
    await chrome.runtime.sendMessage({type: Msg.INVALID_PAGE, message: isGithubPage.message});
  }
}

window.addEventListener('message', (event) => {
  console.log('event: ',event)
  if (event.data.type === Msg.EXTENSION_ACTIVATED) {
    console.log('process page')
    processPage()
  }else if(event.data.type === Msg.EDITOR_DATA) {
    injectPreviewDivFromEdit(event.data.data)
  }
})

const handleContentUpdate = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(()=>{
      window.postMessage({type: Msg.GET_EDITOR_DATA})

      // const sourceDiv = document.querySelector(GITHUB_EDIT_TAB_SELECTOR)
      // injectPreviewDivFromEdit(getTextContentWithFormatting(sourceDiv!))
    }, 1000)
  })
}

// function init(){
//   const script = document.createElement('script');
//   script.textContent = '('+injectScript.toString()+')()';
//   document.head.append(script);
// }

// init();