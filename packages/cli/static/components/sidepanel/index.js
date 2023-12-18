import React from "react"
import './index.css'
import { Link } from "react-router-dom"

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
  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      props.setShowSidePanel(false)
    }
  }

  return (
    <>
      <aside
        className="aside-con"
        style={{ 
          transform: props.showSidePanel ? 'none' : 'translateX(-100%)',
          display: props.showSidePanel ? 'block' : 'none'  
        }}
      >
        <Node
          onClick={handleNodeClick}
          key={props.linksTree.title}
          node={props.linksTree}
        />
      </aside>
    </>
  );
};