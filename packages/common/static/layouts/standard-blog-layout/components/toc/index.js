import React from "react"
import './index.css'

export default function Toc(props) {
  return (
    <div className="toc-wrapper">
      {/* TODO: this can come from props */}
      <div className="toc-header">In this article</div>
      <aside className="toc-aside-con">
        {props.toc.map(heading => (
          <a
            className="toc-anchor-tag"
            style={{ marginLeft: heading.depth * 10 }}
            href={`#${heading.data.id}`}
            key={heading.data.id}
          >
            {heading.value}
          </a>
        ))}
      </aside>
    </div>
  );
};
