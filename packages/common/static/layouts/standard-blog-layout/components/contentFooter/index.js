import React from "react"
import './index.css'

export default function ContentFooter(props) {
  return (
    <div className="content-footer-con">
      {props.prevPage
        ? (
          <a className="content-footer-link" href={props.prevPage.url}>
            <div>
              ⬅️ {props.prevPage.title}
            </div>
          </a>
        )
        : (<div></div>)
      }

      {props.nextPage
        ? (
          <a className="content-footer-link" href={props.nextPage.url}>
            <div style={{ textAlign: 'right' }}>
              {props.nextPage.title} ➡️
            </div>
          </a>
        )
        : (<div></div>)
      }
    </div>
  );
};