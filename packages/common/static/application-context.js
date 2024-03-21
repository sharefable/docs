import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import manifest from './manifest.json'
import config from './config.json'
import sidePanelLinks from './link-tree.json'

const ApplicationContext = createContext(null);

const ApplicationContextProvider = ({ children }) => {
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
    setGlobalState((prev) => ({ ...prev, ...decodeSearchParams(searchParams) }))
  }, [searchParams]);


  const contextValue = {
    globalState,
    addToGlobalState,
    config,
    manifest,
    sidePanelLinks
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};

const useApplicationContext = () => {
  return useContext(ApplicationContext);
};

export {useApplicationContext, ApplicationContextProvider}

const decodeSearchParams = (searchParams) => {
    return [...searchParams.entries()].reduce((acc, [key, val]) => {
      if (typeof val === "object") {
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
  