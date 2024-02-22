import React, { useState, useEffect } from "react"
import './index.css'
import { Link } from "react-router-dom"
import { useApplicationContext } from "../../../../application-context";
import HamburgerMenu from "../hamburger";

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "0.5rem", marginTop: "5px" }}>
      {node.url && <Link to={node.url} data-active={window.location.pathname === node.url}>{node.title}</Link>}
      {!node.url && <div>{node.title}</div>}
      {node.children && (
        <div style={{ marginLeft: "0.5rem" }}>
          {node.children.map((child, idx) => (
            <Node key={`${child.url}-${idx}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidepanel(props) {

  const [showSidePanel, setShowSidePanel] = useState(true);

  const {
    sidePanelLinks: linksTree,
    config,
  } = useApplicationContext();

  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      setShowSidePanel(false)
    }
  }

  if(!config.props.sidepanel.showSidePanel) {
    return <></>
  }

  return (
    <>
      <HamburgerMenu
        showSidePanel={showSidePanel}
        setShowSidePanel={setShowSidePanel}
        showHamburgerMenu={true}
        position="left"
      />
      <aside
        className="aside-con"
        style={{
          transform: showSidePanel ? 'translateX(-100%)' : 'translateX(0%)'
        }}
      >
        <Node
          onClick={handleNodeClick}
          key={linksTree.title}
          node={linksTree}
        />
      </aside>
    </>
  );
};
