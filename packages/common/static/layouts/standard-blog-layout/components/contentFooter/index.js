import React from "react"
import './index.css'

const findPrevPage = (currPageIndex, flatLinks) => {
  for (let i = currPageIndex - 1; i >= 0; i--) {
    const page = flatLinks[i]
    if (page.url) return page;
  }

  return undefined
}

const findNextPage = (currPageIndex, flatLinks) => {
  for (let i = currPageIndex + 1; i < flatLinks.length; i++) {
    const page = flatLinks[i]
    if (page.url) return page;
  }

  return undefined
}

export default function ContentFooter(props) {
  const currIndex = props.flatLinks.findIndex(link => link.url === window.location.pathname)
  const prevPage = findPrevPage(currIndex, props.flatLinks)
  const nextPage = findNextPage(currIndex, props.flatLinks)

  return (
    <div className="content-footer-con">
      {prevPage
        ? (
          <a className="content-footer-link" href={prevPage.url}>
            <div>
              ⬅️ {prevPage.title}
            </div>
          </a>
        )
        : (<div></div>)
      }

      {nextPage
        ? (
          <a className="content-footer-link" href={nextPage.url}>
            <div style={{ textAlign: 'right' }}>
              {nextPage.title} ➡️
            </div>
          </a>
        )
        : (<div></div>)
      }
    </div>
  );
};