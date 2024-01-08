import React, { } from "react";
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
}