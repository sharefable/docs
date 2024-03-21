import React from "react"
import './index.css'

const homeIconUrl = "https://documentden-deployments.s3.us-east-1.amazonaws.com/public/21970027-29e3-4365-9437-b07365574229"
const chevronRightUrl = "https://documentden-deployments.s3.us-east-1.amazonaws.com/public/1eb190ca-8f4b-4294-b002-46da28d5b0c1"

export default function ContentHeader(props) {
  return (
    <div className="content-header-con">
      <a className="content-header-anchor" href={props.homeRoute}>
        <img className="home-icon" src={homeIconUrl} alt="" />
      </a>
      {props.breadcrumb.map((segment, index) => {
        if (segment.path) {
          if (segment.href) {
            return (
              <React.Fragment key={index}>
                <img className="separator" src={chevronRightUrl}  alt="" />
                <a className="content-header-anchor" href={segment.href}>
                  {segment.path}
                </a>
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={index}>
              <img className="separator" src={chevronRightUrl}  alt="" />
              <span className="content-header-anchor">{segment.path}</span>
            </React.Fragment>
          )
        }
      })}
    </div>
  );
};