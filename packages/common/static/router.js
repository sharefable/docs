import React, { useState, lazy, useEffect } from 'react';
import { Routes, Route, } from "react-router-dom";
import Wrapper from './Wrapper';
import Layout from "./layouts/bundled-layout/Layout";
import Header from "./layouts/bundled-layout/components/header"
import Sidepanel from "./layouts/bundled-layout/components/sidepanel"
import Footer from "./layouts/bundled-layout/components/footer"
import Toc from './layouts/bundled-layout/components/toc';
import { useApplicationContext } from './application-context';
import loadable from "@loadable/component";
import { PrerenderedComponent } from "react-prerendered-component";
import Loader from './loader/Loader';


const prerenderedLoadable = dynamicImport => {
  const LoadableComponent = loadable(dynamicImport, {
      fallback: <div style={{height: '100vh'}}><Loader /></div>,
    });
  return React.memo(props => (
      // you can use the `.preload()` method from react-loadable or react-imported-component`
      <PrerenderedComponent live={LoadableComponent.load()}>
      <LoadableComponent {...props} />
      </PrerenderedComponent>
  ));
};


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

export default function Router() {

  const {
    globalState,
    addToGlobalState,
    showSidePanel,
    handleShowSidePanel,
    config,
    manifest,
    sidePanelLinks
  } = useApplicationContext();

  
  return (
    <>
      <Routes>
        <ROUTER_CONFIG />
      </Routes>
    </>
  );
}