import React from "react"
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
    <HeaderStyle />
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

const headerStyles = `
.header-con {
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

`

function HeaderStyle() {
  return (
    <style>{headerStyles}</style>
  )
}