import React from "react"

const Node = ({ node }) => {
    return (
      <div style={{ marginLeft: "1rem" }}>
        {node.url && <a href={node.url}>{node.title}</a>}
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
      <div>
        <Node key={props.linksTree.title} node={props.linksTree} />
      </div>
    );
};
  