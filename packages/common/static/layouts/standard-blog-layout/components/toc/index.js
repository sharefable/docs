import React from "react"
import './index.css'

export default function Toc(props) {
  if (!props.toc.length) return <></>

  return (
    <div className="toc-wrapper">
      <p className="toc-header">{props.props.title}</p>
      <ul className="toc-aside-con">
        {props.toc.map(heading => (
          <li
            style={{
              marginLeft: (heading.depth - 1) * 15
            }}
            className='toc-list-item'
            key={`${heading.data.hProperties.id}`}
          >
            <a
              style={{ background: 'transparent' }}
              href={`#${heading.data.id}`}
            >
              {heading.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
