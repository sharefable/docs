import React from "react"
import './index.css'

const flattenObject = (obj, result = []) => {
  result.push({
    title: obj.title,
    url: obj.url
  });

  if (obj.children && obj.children.length > 0) {
    obj.children.forEach(child => flattenObject(child, result));
  }

  return result;
};

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
  const flatLinks = flattenObject(props.linksTree)
  const currIndex = flatLinks.findIndex(link => link.url === window.location.pathname)
  const prevPage = findPrevPage(currIndex, flatLinks)
  const nextPage = findNextPage(currIndex, flatLinks)

  return (
    <div className="content-footer-con">
      {prevPage
        ? (
          <a className="fable-prev-page" href={prevPage.url}>
            <div className="content-footer-link">
              {prevPage.title}
            </div>
          </a>
        )
        : (<></>)
      }

      {nextPage
        ? (
          <a className="fable-next-page" href={nextPage.url}>
            <div className="content-footer-link" style={{ textAlign: 'right' }}>
              {nextPage.title}
            </div>
          </a>
        )
        : (<></>)
      }
    </div>
  );
};