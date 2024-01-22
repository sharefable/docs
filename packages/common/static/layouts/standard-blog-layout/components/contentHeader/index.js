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

const findLink = (path, flatLinks) => {
  for (const link of flatLinks) {
    if (link.url === path) {
      return true;
    }
  }

  return false;
}

const getBreadcrumbSegment = (currPath, isLink, path) => {  
  switch (currPath) {
    case '/':
      return <></>
    default:
      return isLink
        ? (
          <>
            <span className="separator">{' > '}</span>
            <a className="content-header-anchor" href={currPath}>
              {path}
            </a>
          </>
        )
        : (
          <>
            <span className="separator">{' > '}</span>
            <span>{path}</span>
          </>
        )
  }
}

export default function ContentHeader(props) {
  const flatLinks = flattenObject(props.linksTree)
  const pathArray = window.location.pathname.split('/')

  return (
    <div className="content-header-con">
      {/* TODO include global prefix here in the href  */}
      <a className="content-header-anchor" href="/">🏠</a>
      {pathArray.map((path, index, arr) => {
        const currPath = arr.slice(0, index + 1).join('/')
        return (
          <span key={index}>
            {getBreadcrumbSegment(currPath, findLink(currPath, flatLinks), path)}
          </span>
        )
      })}
    </div>
  );
};