import React from "react"
import './index.css'

export default function Toc(props) {
  if (!props.toc.length) return <></>

  return (
    <div className="toc-wrapper">
      <div className="toc-header">{props.props.title}</div>
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
