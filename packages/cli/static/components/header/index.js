import React from "react"
import './index.css'
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
          <a key={idx} href={link.url}>{link.title}</a>
        ))}
      </div>
    </header>
  )
}