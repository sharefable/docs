import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

<IMPORT_STATEMENTS />

const filePaths = [<CRAWABLE_ROUTES />]
const bodyEl = document.querySelector("body");

if (!document.querySelector("#invisible-links")) {
  const linksWrapperEl = document.createElement("div");
  linksWrapperEl.setAttribute("id", "invisible-links");
  linksWrapperEl.style.display = "none";

  filePaths.forEach((filePath) => {
    const linkEl = document.createElement("a");
    linkEl.setAttribute("href", filePath);
    linksWrapperEl.appendChild(linkEl);
  });

  bodyEl.appendChild(linksWrapperEl);
}

export const router = createBrowserRouter([
  <ROUTER_CONFIG />
]);
