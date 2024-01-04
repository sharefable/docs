import React, { useEffect, useState } from "react";
import { Msg } from "../types";

export default function App() {
    const [extensionMessage, setExtensionMessage] = useState('Loading Mdx Preview')

    async function injectScripts (){
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func:  () => {
            const pth = 'injectScript.js';
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(pth);
            (document.head || document.documentElement).appendChild(script)

            script.onload = ()=>{
                window.postMessage({type: Msg.EXTENSION_ACTIVATED})
            }
        },
        });
    }

    useEffect(()=>{
        chrome.runtime.onMessage.addListener((request)=>{
            if(request.type === Msg.INVALID_PAGE){
                setExtensionMessage(request.message)
            }
        })

        injectScripts();
    },[])
  return <h1>{extensionMessage}</h1>;
}
