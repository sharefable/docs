import React, { useEffect } from "react";
import HamburgerMenuIcon from '../../assets/hamburger-menu.svg'
import './index.css'

export default function HamburgerMenu(props) {

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) props.setShowSidePanel(false);
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
      style={{ backgroundColor: props.showSidePanel ? 'pink' : 'transparent' }}
    >
      <img
        src={HamburgerMenuIcon}
        alt="Hamburger Menu Icon"
        width={20}
      />
    </div>

  )
}