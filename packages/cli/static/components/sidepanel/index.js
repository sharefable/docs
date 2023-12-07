import React from "react"
import './index.css'
import {Link} from "react-router-dom"

const Node = ({ node }) => {
  return (
    <div style={{ marginLeft: "1rem" }}>
      {node.url && <Link to={node.url}>{node.title}</Link>}
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
  return (
    <>
      <aside className="aside-con">
        <Node key={props.linksTree.title} node={props.linksTree} />
      </aside>
      {
        props.showSidePanel ? (
          <aside className="aside-con aside-con-responsive">
            <Node key={props.linksTree.title} node={props.linksTree} />
          </aside>
        ) : (<></>)
      }
    </>
  );
};
