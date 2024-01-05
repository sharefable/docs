import React, { } from "react";
import './index.css'

export default function HamburgerMenu(props) {

  return (
    <>
    <HamburgerStyle />
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

const hamburgerStyles = `
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

function HamburgerStyle() {
  return (
    <style>
      {hamburgerStyles}
    </style>
  )
}