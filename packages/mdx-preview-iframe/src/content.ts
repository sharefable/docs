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

export const layoutCode = `
import React, { useState } from 'https://esm.sh/react'
import Header from './component/header'
import Sidepanel from './component/sidepanel'
import sidePanelLinks from "./sidepanel-links.json"

export default function Layout(props) {
  const [showSidePanel, setShowSidePanel] = useState(false)

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
export const hamburgerCss = `
.hamburger-menu-icon {
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: none;
  margin-left: 0.5rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

@media (max-width: 800px) {
  .hamburger-menu-icon {
    display: flex;
  }
}
`

export const headerCode = `
import React from "https://esm.sh/react"
import './header.css'
import HamburgerMenu from "../hamburger";

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
        <HamburgerMenu
          showSidePanel={props.showSidePanel}
          setShowSidePanel={props.setShowSidePanel}
          showHamburgerMenu={props.showHamburgerMenu}
        />
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
export const hamburgerCode = `
import React, { useEffect } from "https://esm.sh/react";
import HamburgerMenuIcon from '../../assets/hamburger-menu.svg'
import './hamburger.css'

export default function HamburgerMenu(props) {

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) props.setShowSidePanel(true);
      else props.setShowSidePanel(false);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div
      className="hamburger-menu-icon"
      onClick={() => props.setShowSidePanel((prevState) => !prevState)}
      style={{ 
        backgroundColor: props.showSidePanel ? 'transparent' : 'var(--accent-color)',
        display: props.showHamburgerMenu ? 'block' : 'none'
      }}
    >
    <img
      src={HamburgerMenuIcon}
      alt="Hamburger Menu Icon"
      width={20}
    />
    </div>

  )
}`

export const sidePanelCode = `
import React from "https://esm.sh/react"
import { Link } from "https://esm.sh/react-router-dom"
import './sidePanel.css'

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "1rem" }}>
      {node.url && <Link to={node.url} data-active={window.location.pathname === node.url }>{node.title}</Link>}
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

export const sidePanelCss = `
.aside-con {
  flex: 1;
  border-right: 1px solid var(--border-color);
  min-width: 250px;
  max-width: 250px;
  padding: 1rem;
  overflow: auto;
  transition: all 0.3s;
  background-color: var(--background-primary-color);
}

.aside-con a {
  display: block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.aside-con a[data-active="true"] {
  color: var(--primary-color);
}

@media (max-width: 800px) {
  .aside-con {
    height: 100%;
    position: fixed;
    border-top: 1px solid var(--border-color);
  }
}

`

export const hambergerSvg = `
<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"/></svg>
`