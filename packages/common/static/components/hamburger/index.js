import React, { useEffect } from "react";
import HamburgerMenuIcon from '../../assets/hamburger-menu.svg'
import './index.css'

export default function HamburgerMenu(props) {

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) props.setShowSidePanel(true);
      else props.setShowSidePanel(false);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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