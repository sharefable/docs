import { FileName } from "./types";

export const initialCode = `
  import React from "https://esm.sh/react@18.2.0"
  import { createRoot } from "https://esm.sh/react-dom@18.2.0/client"
  import { BrowserRouter } from 'https://esm.sh/react-router-dom'
  import FallBackComponent from './fallBack.jsx'
  import App from './app.jsx'
  import './root.css'
  import './index.css'
  import { ApplicationContextProvider } from "./application-context.jsx";
  const root = createRoot(document.getElementById("root"))
  root.render( <BrowserRouter><div><ApplicationContextProvider><FallBackComponent><App /></FallBackComponent></ApplicationContextProvider></div> </BrowserRouter>)
`;

export const appContext = `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import manifest from './manifest.json'
import config from './config.json'
import sidePanelLinks from './link-tree.json'

const ApplicationContext = createContext(null);

const ApplicationContextProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [globalState, setGlobalState] = useState({});

  const [showSidePanel, setShowSidePanel] = useState(config.props.sidepanel.showSidePanel)

  const handleShowSidePanel = (updatedShowSidePanel) => {
    setShowSidePanel(config.props.sidepanel.showSidePanel && updatedShowSidePanel)
  }

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) handleShowSidePanel(true);
      else handleShowSidePanel(false);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const contextValue = {
    globalState,
    addToGlobalState,
    showSidePanel,
    handleShowSidePanel,
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
`

export const appCode = `
  import React, { useState, useEffect } from "https://esm.sh/react@18.2.0"
  import Component from "./${FileName.MDX_BUILD_JSX}"
  import { useSearchParams, Routes, Route } from 'https://esm.sh/react-router-dom'
  import Layout from "./layouts/bundled-layout/Layout";
  import Header from "./layouts/bundled-layout/components/header"
  import Sidepanel from "./layouts/bundled-layout/components/sidepanel"
  import Footer from "./layouts/bundled-layout/components/footer"
  import { useApplicationContext } from './application-context';

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
          <Route
            path="/"
            element={
              <Layout config={config}
              headerComp={(props) => <Header 
                props={config.props.header} 
                manifest={manifest} 
                config={config} 
                {...props}
                /> 
              }
              sidepanelComp={(props) => <Sidepanel 
                manifest={manifest} 
                config={config} 
                linksTree={sidePanelLinks} 
                {...props}
                />
              }
              footerComp={(props) => <Footer 
                props={config.props.footer}
                {...props}
                />
              }
              >
                <Component globalState={globalState} addToGlobalState={addToGlobalState} manifest={manifest} config={config}/>
              </Layout>
            }
          />
        </Routes>
      </>
    );
  }
`;

export const fallbackCode = `
import React, { Component } from "https://esm.sh/react";

export default class ErrorBoundary extends Component{
    constructor(props) {
      super(props);
      this.state = { 
        error: null,
        hasError: false 
      };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error: error };
    }
  
    componentDidCatch(error, errorInfo) {
        console.log('err: ', error, errorInfo)
    }
  
    render() {
      if (this.state.hasError) {
        return <div>{this.state.error.message}</div>
      }
  
      return this.props.children; 
    }
  }
`;