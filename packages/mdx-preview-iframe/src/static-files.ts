export const hambergerSvg = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path d="M 5 8 A 2.0002 2.0002 0 1 0 5 12 L 45 12 A 2.0002 2.0002 0 1 0 45 8 L 5 8 z M 5 23 A 2.0002 2.0002 0 1 0 5 27 L 45 27 A 2.0002 2.0002 0 1 0 45 23 L 5 23 z M 5 38 A 2.0002 2.0002 0 1 0 5 42 L 45 42 A 2.0002 2.0002 0 1 0 45 38 L 5 38 z"/></svg>`;

export const hamburgerCss = `.hamburger-menu-icon {
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
}`;

export const hamburgerCode = `import React, { } from "https://esm.sh/react@18.2.0";
import './index.css'

export default function HamburgerMenu(props) {

  return (
    <>
    <div
      className="hamburger-menu-icon"
      onClick={() => props.setShowSidePanel((prevState) => !prevState)}
      style={{ 
        backgroundColor: props.showSidePanel ? 'transparent' : 'var(--accent-color)',
        display: props.showHamburgerMenu ? 'block' : 'none'
      }}
    >
      <img
        src="https://fable-tour-app-gamma.s3.ap-south-1.amazonaws.com/root/usr/org/206/443a5a856de3425a8baa9eae3f2befb4"
        alt="Hamburger Menu Icon"
        width={20}
      />
    </div>
    </>
  )
}`;

export const headerCss = `.header-con {
  /* border-bottom: 1px solid var(--border-color); */
  position: sticky;
  background: var(--background-secondary-color);
  font-weight: 500;
  padding: 16px 40px;
  top: 0;
  z-index: 1;
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
  height: 32px;
  object-fit: contain;
}

.link-con {
  display: flex;
  gap: 2rem;
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
  padding: 12px;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
}

.cta-link:hover {
  color: var(--primary-color);
  background-color: transparent;
}
`;

export const headerCode = `import React from "https://esm.sh/react@18.2.0"
import './index.css'
import HamburgerMenu from "../hamburger";
import { useApplicationContext } from "../../../../application-context";

export default function Header(props) {

  const {
    showSidePanel,
    handleShowSidePanel,
    config
  } = useApplicationContext()

  const showHamburgerMenu = config.props.sidepanel.showSidePanel;
  const headerProps = config.props.header;

  let linkAlignment = 'flex-start'

  switch (headerProps.navLinks.alignment) {
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
    <>
    <header className="header-con">
      <div className="header-con-inner">
        <HamburgerMenu
          showSidePanel={showSidePanel}
          setShowSidePanel={handleShowSidePanel}
          showHamburgerMenu={showHamburgerMenu}
        />
        <img
          src={headerProps.logo.imageUrl}
          className="header-logo"
        />
        <div
          className="link-con"
          style={{ justifyContent: linkAlignment }}
        >
          {headerProps.navLinks.links.map((link, idx) => (
            <a className="links" key={idx} href={link.url}>{link.title}</a>
          ))}
          {headerProps.cta && (
            <a href={headerProps.cta.link} className="cta-link">
              {headerProps.cta.title}
            </a>
          )}
        </div>
      </div>
    </header>
    </>
  )
}
`;

export const sidePanelCss = `.aside-con {
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
`;

export const sidePanelCode = `import React from "https://esm.sh/react@18.2.0"
import './index.css'
import { Link } from "https://esm.sh/react-router-dom"
import { useApplicationContext } from "../../../../application-context";

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "1rem" }}>
      {node.url && <Link to={node.url} data-active={window.location.pathname === node.url}>{node.title}</Link>}
      {!node.url && <div>{node.title}</div>}
      {node.children && (
        <div style={{ marginLeft: "1rem" }}>
          {node.children.map((child, idx) => (
            <Node key={\`\${child.url}-\${idx}\`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidepanel(props) {

  const {
    showSidePanel,
    handleShowSidePanel,
    sidePanelLinks: linksTree
  } = useApplicationContext();

  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      handleShowSidePanel(false)
    }
  }

  return (
    <>
      <aside
        className="aside-con"
        style={{
          transform: showSidePanel ? 'none' : 'translateX(-100%)',
          display: showSidePanel ? 'block' : 'none'
        }}
      >
        <Node
          onClick={handleNodeClick}
          key={linksTree.title}
          node={linksTree}
        />
      </aside>
    </>
  );
};

`;

export const indexCss = `html {
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
  color: var(--text-tertiary-color);
  line-height: var(--line-height);
}

blockquote {
  border-left: 5px solid var(--accent-color);
  padding: 10px 20px;
  margin: 0 0 10px 0;
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

p, li {
  margin: var(--p-margin);
  padding: var(--p-padding);
  font-size: var(--p-font-size);
  line-height: var(--p-line-height);
  font-weight: var(--p-font-weight);
}

.con {
  display: flex;
  flex-direction: column;
}

.main-wrapper {
  scroll-margin-top: 100px;
  display: flex;
  flex-grow: 1;
  align-items: stretch;
}

.main-con {
  flex: 3;
  width: 100%;
}

h1 a,
h2 a,
h3 a,
h4 a,
h5 a,
h6 a {
  background-color: transparent !important;
}


h1,
h2,
h3,
h4,
h5,
h6 {
  scroll-margin-top: 6.9rem;
}

a .icon {
  opacity: 0;
  transition: all 0.2s ease-in;
}

a .icon:hover {
  opacity: 1;
}

a .icon-link::after {
  content: '🔗';
  font-size: 1rem;
  vertical-align: middle;
}
`;

export const layoutCode = `import React from "https://esm.sh/react@18.2.0"

export default function Layout(props) {
  const {
    headerComp: Header, 
    sidepanelComp: Sidepanel, 
    footerComp: Footer,
    tocComp: Toc,
  } = props;

  return (
    <div className='con'>
      <Header />
      <div className='main-wrapper'>
        <Sidepanel />
        <main className='main-con'>
          {props.children}
        </main>
        <Toc />
      </div>
      <Footer />
    </div>

  )
}`;

export const footerCode = `import React from "https://esm.sh/react@18.2.0"
import './index.css'

export default function Footer(props) {
  const footerLogoUrl = props.props.logo // string
  const copyrightText = props.props.copyright || '' // string
  const links = props.props.links || [] // Array<{ heading: string, links: Array<{title: string, link: string}> }>

  return (
    <footer className="footer">
      <div className="footer-con">
        <div className="footer-con-main">
          <div>
            {footerLogoUrl ? <img
              className="footer-logo"
              src={footerLogoUrl}
              alt="logo"
            /> : <></>}
          </div>
          <div className="footer-con-links">
            {links.map(({ heading, links }, idx1) => {
              return (
                <div key={idx1}>
                  <p className="footer-link-title">{heading}</p>
                  <ul className="footer-links">
                    {links?.map(({ title, url }, idx2) => {
                      return (
                        <li key={\`\${idx1}.\${idx2}\`}>
                          <a href={url}>
                            {title}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
        <p className="footer-copyright-text">
          {copyrightText}
        </p>
      </div>
    </footer>
  )
}
`;

export const footerCss = `.footer {
  background: var(--primary-color);
  padding: 5rem 3.6rem 3rem;
}

.footer-con {
  max-width: 1500px;
  margin: 0 auto;
  font-size: 0.875rem;
}

.footer-con-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6rem;
}

.footer-con-links {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  max-width: 50rem;
  gap: 6rem;
  flex-wrap: wrap;
}

.footer-link-title {
  font-weight: 600;
  margin: 0;
  margin-bottom: 1.6rem;
  color: var(--text-secondary-color);
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 0.7rem;
}

.footer-links li {
  margin: 0;
}

.footer-links li a {
  font-size: 0.875rem;
  color: var(--text-secondary-color);
  opacity: 0.7;
}


.footer-links li a:hover {
  background: transparent;
}

.footer-logo {
  width: 200px;
  height: 63px;
}

.footer-copyright-text {
  margin-top: 6rem;
  font-size: 0.875rem;
  color: var(--text-secondary-color);
  opacity: 0.5;
  font-weight: 600;
}
`;
