import React from "react"
import './index.css'
import { Link } from "react-router-dom"
import { useApplicationContext } from "../../../../application-context";

const Node = ({ node, onClick }) => {
  return (
    <div onClick={onClick} style={{ marginLeft: "1rem" }}>
      {node.url && <Link to={node.url} data-active={window.location.pathname === node.url}>{node.title}</Link>}
      {!node.url && <div>{node.title}</div>}
      {node.children && (
        <div style={{ marginLeft: "1rem" }}>
          {node.children.map((child, idx) => (
            <Node key={`${child.url}-${idx}`} node={child} />
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

