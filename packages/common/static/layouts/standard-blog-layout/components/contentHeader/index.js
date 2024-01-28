import React from "react"
import './index.css'

export default function ContentHeader(props) {

  return (
    <div className="content-header-con">
      <a className="content-header-anchor" href={props.homeRoute}>🏠</a>
      {props.breadcrumb.map((segment, index) => {
        if (segment.path) {
          if (segment.href) {
            return (
              <React.Fragment key={index}>
                <span className="separator" >{' > '}</span>
                <a className="content-header-anchor" href={segment.href}>
                  {segment.path}
                </a>
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={index}>
              <span className="separator">{' > '}</span>
              <span>{segment.path}</span>
            </React.Fragment>
          )
        }
      })}
    </div>
  );
};