import React, { useEffect, useState } from "react";

export default function App() {
    const [extensionMessage, setExtensionMessage] = useState('Loading Mdx Preview')

    useEffect(()=>{
        chrome.runtime.onMessage.addListener((request)=>{
            if(request.type === 'invalid_page'){
                setExtensionMessage(request.message)
            }
        })

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            if(activeTab.id)
            chrome.tabs.sendMessage(activeTab.id, {type: "activated"});
        });
    },[])
  return <h1>{extensionMessage}</h1>;
}
