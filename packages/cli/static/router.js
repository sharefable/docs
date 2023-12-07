import React, { useState, lazy, useEffect } from 'react';
import { Routes, Route, useSearchParams } from "react-router-dom";
import manifest from "./mdx-dist/manifest.json"
import config from './config.json'
import Layout from "./Layout";


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

const decodeSearchParams = (searchParams) => {
  return [...searchParams.entries()].reduce((acc, [key, val]) => {
    if(typeof val === "object") {
      try {
        return {
          ...acc,
          [key]: JSON.parse(val),
        };
      } catch {
        return {
          ...acc,
          [key]: val,
        };
      }
    } else {
      return {
        ...acc,
        [key]: val,
      };
    }
  }, {});
};

export default function Router() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [globalState, setGlobalState] = useState({});

  const updateUrlParams = (key, value) => {
    setSearchParams((prev) => {
      return {
        ...decodeSearchParams(prev),
        [key]: typeof value === "object" ? JSON.stringify(value) : value,
      };
    });
  };

  const addToGlobalState = (key, value, type = "url") => {
    if (type === "url") {
      updateUrlParams(key, value);
    }
    setGlobalState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setGlobalState((prev) => ({...prev, ...decodeSearchParams(searchParams)}))
  }, [searchParams]);

  return (
    <>
      <Routes>
        <ROUTER_CONFIG />
      </Routes>
    </>
  );
}

