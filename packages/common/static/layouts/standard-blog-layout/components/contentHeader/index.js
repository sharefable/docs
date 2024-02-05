import React from "react"
import './index.css'
import ChevronRight from './chevron-right-solid.svg'
import HomeIcon from './home.svg'

export default function ContentHeader(props) {
  return (
    <div className="content-header-con">
      <a className="content-header-anchor" href={props.homeRoute}>
        <img className="home-icon" src={HomeIcon} alt="" />
      </a>
      {props.breadcrumb.map((segment, index) => {
        if (segment.path) {
          if (segment.href) {
            return (
              <React.Fragment key={index}>
                <img className="separator" src={ChevronRight}  alt="" />
                <a className="content-header-anchor" href={segment.href}>
                  {segment.path}
                </a>
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={index}>
              <img className="separator" src={ChevronRight}  alt="" />
              <span className="content-header-anchor">{segment.path}</span>
            </React.Fragment>
          )
        }
      })}
    </div>
  );
};