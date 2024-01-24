import React, { useState, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import Wrapper from './Wrapper';
import Layout from "./layouts/bundled-layout/Layout";
import Header from "./layouts/bundled-layout/components/header"
import Sidepanel from "./layouts/bundled-layout/components/sidepanel"
import Footer from "./layouts/bundled-layout/components/footer"
import Toc from './layouts/bundled-layout/components/toc';
import { useApplicationContext } from './application-context';
import loadable from "@loadable/component";
import { PrerenderedComponent } from "react-prerendered-component";


const prerenderedLoadable = dynamicImport => {
  const LoadableComponent = loadable(dynamicImport);
  return React.memo(props => (
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

  const location = useLocation();
  const {
    globalState,
    addToGlobalState,
    showSidePanel,
    handleShowSidePanel,
    config,
    manifest,
    sidePanelLinks
  } = useApplicationContext();

    useEffect(() => {
      window.scrollTo(0,0)
  }, [location]);

  return (
    <>
      <Routes>
        <ROUTER_CONFIG />
      </Routes>
    </>
  );
}