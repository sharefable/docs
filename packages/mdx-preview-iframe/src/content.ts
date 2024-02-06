import { FileName, ENTRY_POINT } from "./types";

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

export const appCode = `
  import React, { useState, useEffect } from "https://esm.sh/react@18.2.0"
  import Component from "./${FileName.MDX_BUILD_JSX}"
  import { useSearchParams, Routes, Route } from 'https://esm.sh/react-router-dom'
  import Layout from "./layouts/bundled-layout/Layout";
  import Header from "./layouts/bundled-layout/components/header"
  import Sidepanel from "./layouts/bundled-layout/components/sidepanel"
  import Footer from "./layouts/bundled-layout/components/footer"
  import Toc from './layouts/bundled-layout/components/toc';
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

    const getEntry = () => {
      const entryPoint = window.localStorage.getItem(\`${ENTRY_POINT}\`)
      const entry = config.urlMapping.entries[entryPoint];
      return entry;
    }
    const entry = getEntry();

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
              tocComp={(props) => <Toc 
                props={config.props.toc}
                toc={entry.toc}
                {...props}
              />} 
              frontmatter={entry.frontmatter}
              toc={entry.toc}             
              >
                <Component 
                  globalState={globalState} 
                  addToGlobalState={addToGlobalState} 
                  manifest={manifest} 
                  config={config}  
                  frontmatter={entry.frontmatter}
                  toc={entry.toc}
                />
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