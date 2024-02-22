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
  import StickyBanner from './layouts/bundled-layout/components/stickyBanner';
  import ContentHeader from './layouts/bundled-layout/components/contentHeader';
  import ContentFooter from './layouts/bundled-layout/components/contentFooter';
  import { flattenObject, getBreadcrumb, getHomeRoute, getNextPage, getPrevPage } from './utils'
  import { useApplicationContext } from './application-context';

  export default function Router() {
    const {
      globalState,
      addToGlobalState,
      config,
      manifest,
      sidePanelLinks
    } = useApplicationContext();

    const getEntry = () => {
      const entryPoint = window.localStorage.getItem(\`${ENTRY_POINT}\`)
      const entry = Object.values(config.urlMapping.entries).find(el => el.filePath === entryPoint);
      return entry;
    }
    const entry = getEntry();

    const flatLinks = flattenObject(sidePanelLinks)
    const homeRoute = getHomeRoute(config)

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
              stickyBannerComp={(props) => <StickyBanner
                props={config.props.stickyBanner}
                {...props}
                />
              }
              contentHeaderComp={(props) => <ContentHeader
               props={config.props.contentHeader}
               manifest={manifest} 
               config={config} 
               linksTree={sidePanelLinks} 
               flatLinks={flatLinks}
               pathArray={window.location.pathname.split('/')}
               breadcrumb={getBreadcrumb(window.location.pathname.split('/'), flatLinks, config)}
               homeRoute={homeRoute}
               {...props}
               />
              }
            contentFooterComp={(props) => <ContentFooter
              props={config.props.contentFooter}
              manifest={manifest} 
              config={config} 
              flatLinks={flatLinks}
              linksTree={sidePanelLinks} 
              nextPage={getNextPage(flatLinks.findIndex(link => link.url === window.location.pathname), flatLinks)}
              prevPage={getPrevPage(flatLinks.findIndex(link => link.url === window.location.pathname), flatLinks)}
              {...props}
            />
            }           
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