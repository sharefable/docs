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
      <div className="header-con-inner">
        <HamburgerMenu
          showSidePanel={props.showSidePanel}
          setShowSidePanel={props.setShowSidePanel}
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
