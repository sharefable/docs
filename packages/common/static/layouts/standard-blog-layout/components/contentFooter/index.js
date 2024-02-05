import React from "react"
import './index.css'
import ArrowIcon from './arrow-right-solid.svg'

export default function ContentFooter(props) {
  return (
    <div className="content-footer-con">
      {props.prevPage
        ? (
          <a className="content-footer-link" href={props.prevPage.url}>
            <div className="link-marker">Previous</div>
            <div className="link-title">
              <img
                src={ArrowIcon}
                alt=""
                style={{ width: '15px', verticalAlign: 'text-bottom', marginRight: '0.5rem', transform: 'rotate(180deg)', opacity: 0.7 }}
              />
              {props.prevPage.title}
            </div>
          </a>
        )
        : (<div style={{width: '100%'}}></div>)
      }

      {props.nextPage
        ? (
          <a style={{ textAlign: 'right' }} className="content-footer-link" href={props.nextPage.url}>
            <div className="link-marker">Next</div>
            <div className="link-title">
              {props.nextPage.title}
              <img
                src={ArrowIcon}
                alt=""
                style={{ width: '15px', verticalAlign: 'text-bottom', marginLeft: '0.5rem', opacity: 0.7}}
              />
            </div>
          </a>
        )
        : (<div style={{width: '100%'}}></div>)
      }
    </div>
  );
};