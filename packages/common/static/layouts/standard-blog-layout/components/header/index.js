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

  const hamburgerEl = document.getElementsByClassName('hamburger-menu-icon');
  let hamburgerElPosition;

  if (hamburgerEl.length) {
    hamburgerElPosition = hamburgerEl[0].classList.contains('hamburger-left') ? 'left' : 'right';
  }


  return (
    <>
      <header className="header-con">
        <div
          className={`header-con-inner ${showHamburgerMenu && "hamburger-show"}`}
          style={showHamburgerMenu ? {
            marginLeft: hamburgerElPosition === 'left' ? '3.5rem' : '0',
            marginRight: hamburgerElPosition === 'right' ? '3.5rem' : '0'
          } : {}}
        >
          <img
            src={headerProps.logo.imageUrl}
            className="header-logo"
          />
          <div
            className="link-con"
            style={{ justifyContent: 'flex-end' }}
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
        <HamburgerMenu
          showSidePanel={showSidePanel}
          setShowSidePanel={handleShowSidePanel}
          showHamburgerMenu={showHamburgerMenu}
          position="left"
        />
      </header>
    </>
  )
}
