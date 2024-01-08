import { FileName } from "./types"

export const initialCode = `
  import React from "https://esm.sh/react@18.2.0"
  import { createRoot } from "https://esm.sh/react-dom@18.2.0/client"
  import { BrowserRouter } from 'https://esm.sh/react-router-dom'
  import FallBackComponent from './fallBack.jsx'
  import App from './app.jsx'
  import './root.css'
  import './index.css'
  const root = createRoot(document.getElementById("root"))
  root.render( <BrowserRouter><div><FallBackComponent><App /></FallBackComponent></div> </BrowserRouter>)
`

export const appCode = `
  import React, { useState, useEffect } from "https://esm.sh/react@18.2.0"
  import Component from "./${FileName.MDX_BUILD_JSX}"
  import Layout from "./layout.jsx"
  import config from './${FileName.CONFIG_JSON}'
  import manifest from './${FileName.MANIFEST_JSON}'
  import { useSearchParams, Routes, Route } from 'https://esm.sh/react-router-dom'
  
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
      setGlobalState((prev) => ({ ...prev, ...decodeSearchParams(searchParams) }))
    }, [searchParams]);
  
    return (
      <>
        <Routes>
          <Route
            path="/"
            element={
              <Layout config={config}>
                <Component globalState={globalState} addToGlobalState={addToGlobalState} manifest={manifest} config={config}/>
              </Layout>
            }
          />
        </Routes>
      </>
    );
  }
`

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
`