import React from "react"
import './index.css'
import { Link } from "react-router-dom"
import { useApplicationContext } from "../../../../application-context";

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "1rem" }}>
      {node.url && <Link to={node.url} data-active={window.location.pathname === node.url }>{node.title}</Link>}
      {!node.url && <div>{node.title}</div>}
      {node.children && (
        <div style={{ marginLeft: "1rem" }}>
          {node.children.map((child) => (
            <Node key={child.url} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidepanel(props) {

  const {
    showSidePanel,
    handleShowSidePanel,
    sidePanelLinks: linksTree
  } = useApplicationContext();

  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      handleShowSidePanel(false)
    }
  }

  return (
    <>
      <SidepanelStyles />
      <aside
        className="aside-con"
        style={{ 
          transform: showSidePanel ? 'none' : 'translateX(-100%)',
          display: showSidePanel ? 'block' : 'none'  
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

const sidepanelStyles = `
.aside-con {
  flex: 1;
  border-right: 1px solid var(--border-color);
  min-width: 250px;
  max-width: 250px;
  padding: 1rem;
  overflow: auto;
  transition: all 0.3s;
  background-color: var(--background-primary-color);
}

.aside-con a {
  display: block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.aside-con a[data-active="true"] {
  color: var(--primary-color);
}

@media (max-width: 800px) {
  .aside-con {
    height: 100%;
    position: fixed;
    border-top: 1px solid var(--border-color);
  }
}

`

function SidepanelStyles() {
  return (
    <style>
      {sidepanelStyles}
    </style>
  )
}