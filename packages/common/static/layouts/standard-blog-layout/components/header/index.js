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
