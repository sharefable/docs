import React, { useEffect, useState } from 'react';
import { Msg } from '../types';

export default function App () {
  const [extensionMessage, setExtensionMessage] = useState('Loading Mdx Preview');

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === Msg.INVALID_PAGE) {
        setExtensionMessage(request.message as string);
      }
    });

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0];
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      if (activeTab.id) { chrome.tabs.sendMessage(activeTab.id, { type: Msg.EXTENSION_ACTIVATED }); }
    });
  }, []);
  return <h1>{extensionMessage}</h1>;
}
