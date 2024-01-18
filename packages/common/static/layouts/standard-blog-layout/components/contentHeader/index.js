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

export default function ContentHeader(props) {
  const flatLinks = flattenObject(props.linksTree)
  const pathArray = window.location.pathname.split('/')

  console.log(flatLinks)
  console.log(props.linksTree)

  return (
    <div>
      {/* TODO include global prefix here in the href  */}
      <a href="/">🏠</a>
      {pathArray.map((path, index, arr) => {
        const currPath = arr.slice(0, index + 1).join('/')
        return (
          <span key={index}>
            {index > 0 && <span className="separator">{' / '}</span>}
            {findLink(currPath, flatLinks)
              ? <a href={currPath}>{path}</a>
              : <span className={index === pathArray.length - 1 ? 'active' : ''}>{path}</span>
            }

          </span>
        )
      })}
    </div>
  );
};