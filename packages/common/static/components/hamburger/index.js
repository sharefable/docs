import React, { } from "react";
import HamburgerMenuIcon from '../../assets/hamburger-menu.svg'
import './index.css'

export default function HamburgerMenu(props) {

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
}