import React from "react"
import './index.css'

const arrowRightURl = "https://documentden-deployments.s3.us-east-1.amazonaws.com/public/7e1e81bd-c23c-42dd-aaf1-0a288e38e58e"

export default function ContentFooter(props) {
  return (
    <div className="content-footer-con">
      {props.prevPage
        ? (
          <a className="content-footer-link" href={props.prevPage.url}>
            <div style={{flexGrow: 1, margin: 'auto'}}>
              <img
                src={arrowRightURl}
                alt=""
                style={{ width: '15px', verticalAlign: 'text-bottom', marginRight: '0.5rem', transform: 'rotate(180deg)', opacity: 0.7 }}
              />
            </div>
            <div style={{textAlign: 'end'}} className="link-marker-con">
              <span className="link-marker">Previous</span>
              <p className="link-title">{props.prevPage.title}</p>
            </div>
          </a>
        )
        : (<div style={{ width: '100%' }}></div>)
      }

      {props.nextPage
        ? (
          <a className="content-footer-link" href={props.nextPage.url}>
            <div className="link-marker-con">
              <span className="link-marker">Next</span>
              <p className="link-title">{props.nextPage.title}</p>
            </div>
            <div style={{ margin: 'auto 0' }}>
              <img
                src={arrowRightURl}
                alt=""
                style={{ width: '15px', verticalAlign: 'text-bottom', marginLeft: '0.5rem', opacity: 0.7 }}
              />
            </div>
          </a>
        )
        : (<div style={{ width: '100%' }}></div>)
      }
    </div>
  );
};
