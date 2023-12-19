export const config = `{
  "version": "1.0.0",
  "urlMapping": {
    "globalPrefix": "",
    "entries": {
      "/": {
        "filePath": "index",
        "fileName": "index"
      }
    }
  },
  "props": {
    "header": {
      "logo": {
        "imageUrl": "https://sharefable.com/fable-logo.svg",
        "title": "Fable Docs"
      },
      "navLinks": {
        "alignment": "center",
        "links": [
          {
            "title": "Visit Fable",
            "url": "https://sharefable.com"
          }
        ]
      }
    },
    "sidepanel": {
      "showSidePanel": false
    },
    "content": {},
    "footer": {}
  },
  "theme": {
    "colors": {
      "primary": "#3730a3",
      "textPrimary": "#1e293b",
      "textSecondary": "#ffffff",
      "textTertiary": "#ffffff",
      "backgroundPrimary": "#f3f4f6",
      "backgroundSecondary": "#f3f4f6",
      "accent": "#c7d2fe",
      "border": "#d1d5db",
      "text": "#1e293b",
      "background": "#f3f4f6"
    },
    "typography": {
      "fontSize": 16,
      "fontFamily": "sans-serif",
      "lineHeight": 1.5,
      "h1": {
        "margin": "0 0 24px 0",
        "padding": 0,
        "fontSize": "38px",
        "fontWeight": 700,
        "lineHeight": "48px"
      },
      "h2": {
        "margin": "0 0 32px 0",
        "padding": 0,
        "fontSize": "32px",
        "fontWeight": 600,
        "lineHeight": "36px"
      },
      "h3": {
        "margin": "0 0 32px 0",
        "padding": 0,
        "fontSize": "20px",
        "fontWeight": 600,
        "lineHeight": "26px"
      },
      "h4": {
        "margin": "0 0 24px 0",
        "padding": 0,
        "fontSize": "16px",
        "fontWeight": 600,
        "lineHeight": "22px"
      },
      "h5": {
        "margin": "0 0 24px 0",
        "padding": 0,
        "fontSize": "16px",
        "fontWeight": 600,
        "lineHeight": "22px"
      },
      "h6": {
        "margin": "0 0 24px 0",
        "padding": 0,
        "fontSize": "16px",
        "fontWeight": 600,
        "lineHeight": "22px"
      }
    }
  }
}`

export const initialCode = `
  import React from "https://esm.sh/react@18.2.0"
  import { createRoot } from "https://esm.sh/react-dom@18.2.0/client"
  import FallBackComponent from './fallBack.jsx'
  import Component from "./file.jsx"
  import Layout from "./layout.jsx"
  import config from './config.json'
  import './index.css'
  const root = createRoot(document.getElementById("root"))
  root.render(<div><Layout config={config}><FallBackComponent><Component/></FallBackComponent></Layout></div>)
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

export const layoutCode = `
import React, { useState } from 'https://esm.sh/react'
import Header from './header.jsx'
import Sidepanel from './sidepanel.jsx'
import sidePanelLinks from "./sidepanel-links.json"

export default function Layout(props) {
  const [showSidePanel, setShowSidePanel] = useState(true)

  return (
    <div className='con'>
      <Header
        showSidePanel={showSidePanel}
        showHamburgerMenu={props.config.props.sidepanel.showSidePanel}
        setShowSidePanel={setShowSidePanel}
        props={props.config.props.header}
      />
      <div className='main-wrapper'>
        <Sidepanel setShowSidePanel={setShowSidePanel} showSidePanel={showSidePanel && props.config.props.sidepanel.showSidePanel} linksTree={sidePanelLinks}/>
        <main className='main-con'>
          {props.children}
        </main>
      </div>
    </div>

  )
}
`

export const headerCode = `
import React from "https://esm.sh/react"
import './header.css'
export default function Header(props) {
  let linkAlignment = 'flex-start'

  switch (props.props.navLinks.alignment) {
    case 'left':
      linkAlignment = 'flex-start'
      break;
    case 'center':
      linkAlignment = 'center'
      break;
    case 'right':
      linkAlignment = 'flex-end'
      break;
    default:
      linkAlignment = 'flex-start'
      break;
  }

  return (
    <header className="header-con">
      <div className="header-con-inner">
        <img
          src={props.props.logo.imageUrl}
          className="header-logo"
        />
        <div
          className="link-con"
          style={{ justifyContent: linkAlignment }}
        >
          {props.props.navLinks.links.map((link, idx) => (
            <a className="links" key={idx} href={link.url}>{link.title}</a>
          ))}
          {props.props?.cta && (
            <a href={props.props?.cta.link} className="cta-link">
              {props.props?.cta.title}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

`

export const sidePanelCode = `
import React from "https://esm.sh/react"
import { Link } from "https://esm.sh/react-router-dom"

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "1rem" }}>
      {!node.url && <div>{node.title}</div>}
      {node.children && (
        <div style={{ marginLeft: "1rem" }}>
          {node.children.map((child) => (
            <Node key={child.url} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidepanel(props) {
  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      props.setShowSidePanel(false)
    }
  }

  return (
    <>
      <aside
        className="aside-con"
        style={{ 
          transform: props.showSidePanel ? 'none' : 'translateX(-100%)',
          display: props.showSidePanel ? 'block' : 'none'  
        }}
      >
        <Node
          onClick={handleNodeClick}
          key={props.linksTree.title}
          node={props.linksTree}
        />
      </aside>
    </>
  );
};

`

export const sidePanelLink = `
{
  "title": "Example",
  "url": "/",
  "children": []
}
`

export const headerCss = `
.header-con {
  border-bottom: 1px solid var(--border-color);
  width: 100%;
  position: fixed;
  height: 65px;
  background: var(--background-secondary-color);
  font-weight: 500;
}

.header-con .header-con-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  height: 100%;
}

.header-logo {
  padding: 1rem;
  height: 60%;
  object-fit: contain;
}

.link-con {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: center;
}

.header-con .links {
  font-size: 0.9rem;
  padding: 0.25rem 0.45rem;
  border-radius: 0.25rem;
  color: var(--text-secondary-color);
}

.header-con .links:hover {
  color: var(--text-secondary-color);
  background-color: transparent;
}

.cta-link {
  border: 2px solid var(--primary-color);
  color: var(--text-secondary-color);
  padding: 12px 10px;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
}

.cta-link:hover {
  color: var(--primary-color);
  background-color: transparent;
}

`

export const indexCss = `
  html {
    font-size: var(--font-size);
  }

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--font-family);
    line-height: var(--line-height);
    background-color: var(--background-primary-color);
    color: var(--text-primary-color);
  }

  a {
    text-decoration: none;
    color: var(--text-primary-color);
    line-height: var(--line-height);
  }

  a:hover {
    background-color: var(--accent-color);
    color: var(--primary-color);
  }

  a:active {
    color: var(--primary-color);
  }

  h1 {
    margin: var(--h1-margin);
    padding: var(--h1-padding);
    font-size: var(--h1-font-size);
    line-height: var(--h1-line-height);
    font-weight: var(--h1-font-weight);
  }

  h2 {
    margin: var(--h2-margin);
    padding: var(--h2-padding);
    font-size: var(--h2-font-size);
    line-height: var(--h2-line-height);
    font-weight: var(--h2-font-weight);
  }

  h3 {
    margin: var(--h3-margin);
    padding: var(--h3-padding);
    font-size: var(--h3-font-size);
    line-height: var(--h3-line-height);
    font-weight: var(--h3-font-weight);
  }

  h4 {
    margin: var(--h4-margin);
    padding: var(--h4-padding);
    font-size: var(--h4-font-size);
    line-height: var(--h4-line-height);
    font-weight: var(--h4-font-weight);
  }

  h5 {
    margin: var(--h5-margin);
    padding: var(--h5-padding);
    font-size: var(--h5-font-size);
    line-height: var(--h5-line-height);
    font-weight: var(--h5-font-weight);
  }

  h6 {
    margin: var(--h6-margin);
    padding: var(--h6-padding);
    font-size: var(--h6-font-size);
    line-height: var(--h6-line-height);
    font-weight: var(--h6-font-weight);
  }

  .con {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .main-wrapper {
    display: flex;
    flex-grow: 1;
    align-items: stretch;
    margin-top: 65px;
    height: calc(100vh - 65px);
  }

  .main-con {
    flex: 3;
    width: 100%;
    overflow-y: auto;
  }

`