import React, { useEffect, useState } from "react";
import { Msg } from "../types";

export default function App() {
    const [extensionMessage, setExtensionMessage] = useState('Loading Mdx Preview')

    useEffect(()=>{
        chrome.runtime.onMessage.addListener((request)=>{
            if(request.type === Msg.INVALID_PAGE){
                setExtensionMessage(request.message)
            }
        })

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            if(activeTab.id)
            chrome.tabs.sendMessage(activeTab.id, {type: Msg.EXTENSION_ACTIVATED});
        });
    },[])
  return <h1>{extensionMessage}</h1>;
}
