import React, { useState, useEffect } from "react";
import "./index.css";
import { Link } from "react-router-dom";
import { useApplicationContext } from "../../../../application-context";
import HamburgerMenu from "../hamburger";

const flattenTree = (root) => {
  const stack = root
    .map((node) => ({ node, depth: 0 }))
    .filter((el) => {
      if (!el.node.url && el.node.children?.length <= 0) {
        return false;
      }
      return true;
    });
  const flattenedNodes = [];

  while (stack.length > 0) {
    const { node, depth } = stack.pop();
    const flattenedNode = { ...node, depth };
    flattenedNodes.push(flattenedNode);

    // Push children in reverse order so they are processed in the correct order
    for (let i = node.children?.length - 1; i >= 0; i--) {
      if (node.children[i].title !== ".components") {
        stack.push({ node: node.children[i], depth: depth + 1 });
      }
    }
  }

  return flattenedNodes;
};

export default function Sidepanel(props) {
  const [showSidePanel, setShowSidePanel] = useState(true);

  const { sidePanelLinks: linksTree, config } = useApplicationContext();

  const handleNodeClick = () => {
    if (window.innerWidth < 800) {
      setShowSidePanel(false);
    }
  };

  if (!config.props.sidepanel.showSidePanel) {
    return <></>;
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
          transform: showSidePanel ? "translateX(-100%)" : "translateX(0%)",
        }}
      >
        {flattenTree(linksTree).map((node, idx) => {
          return (
            <div
              style={{ marginLeft: node.depth * 10, marginTop: "5px" }}
              key={idx}
              onClick={handleNodeClick}
            >
              {node.url && (
                <Link
                  to={node.url}
                  data-active={window.location.pathname === node.url}
                >
                  {node.title}
                </Link>
              )}
              {!node.url && <div>{node.title}</div>}
            </div>
          );
        })}
      </aside>
    </>
  );
}
