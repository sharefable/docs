import React, { useState, useEffect } from "react"
import './index.css'
import { useApplicationContext } from "../../../../application-context";
import { Link } from "react-router-dom";

export default function Header(props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    config
  } = useApplicationContext()

  const showHamburgerMenu = config.props.sidepanel.showSidePanel;
  const headerProps = config.props.header;

  const hamburgerEl = document.getElementsByClassName('hamburger-menu-icon');
  let hamburgerElPosition;

  if (hamburgerEl.length) {
    hamburgerElPosition = hamburgerEl[0].classList.contains('hamburger-left') ? 'left' : 'right';
  }

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);


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
          <div className="header-menu-icon" onClick={handleToggleMenu}></div>
          <div className={`menu-content ${menuOpen ? "open" : ""}`}>
            <div style={{ height: "100%", padding: "10px 0" }}>
              <div className="menu-content-mobile">
                {props.props.navLinks.links.map((link) => (
                  <MenuItemMobile key={link.title} item={link} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

const MenuItemMobile = (props) => {

  const hasSublinks = props.item.sublinks && props.item.sublinks.length > 0;

  return (
    <div
      className={`menu-item`}
    >
      <Link
        className="menu-item-header"
        to={props.item.url}
        style={{
          width: "100%",
          color: "inherit",
          display: "block",
          background: "inherit",
        }}
      >
        {props.item.title}
      </Link>
    </div>
  );
};