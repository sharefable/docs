import { Msg } from "@fable-doc/common/dist/cjs/types";
import React, { useEffect, useState } from "react";

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
