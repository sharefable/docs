import React, { useEffect, useState } from "react";
import { Msg } from "../types";

export default function App() {
  const [extensionMessage, setExtensionMessage] = useState("Loading Mdx Preview");
  
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === Msg.INVALID_PAGE) {
        setExtensionMessage(request.message);
      }
    });
  }, []);

  return <h1>{extensionMessage}</h1>;
}
