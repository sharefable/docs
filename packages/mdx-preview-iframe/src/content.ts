import { FileName } from "./types"

export const initialCode = `
  import React from "https://esm.sh/react@18.2.0"
  import { createRoot } from "https://esm.sh/react-dom@18.2.0/client"
  import { BrowserRouter } from 'https://esm.sh/react-router-dom'
  import FallBackComponent from './fallBack.jsx'
  import Component from "./${FileName.MDX_BUILD_JSX}"
  import Layout from "./layout.jsx"
  import config from './${FileName.CONFIG_JSON}'
  import manifest from './${FileName.MANIFEST_JSON}'
  import './root.css'
  import './index.css'
  const root = createRoot(document.getElementById("root"))
  root.render( <BrowserRouter><div><Layout config={config}><FallBackComponent><Component manifest={manifest}/></FallBackComponent></Layout></div> </BrowserRouter>)
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