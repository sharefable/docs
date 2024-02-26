export const flattenObject = (root, result = []) => {
  const stack = root
  .map(node => ({node, depth: 0}))
  .reverse()
  .filter(el => el.node.children?.length > 0);
  
  while (stack.length > 0) {
    const { node, depth } = stack.pop();
    const flattenedNode = { ...node, depth };
    result.push(flattenedNode);

    for (let i = node.children?.length - 1; i >= 0; i--) {
      stack.push({ node: node.children[i], depth: depth + 1 });
    }  
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
    case "":
      return {}
    default:
      return isLink ? { href: currPath, path } : { path }
  }
}

export const getBreadcrumb = (pathArray, flatLinks, config) => {
  const breadcrumbSegments = pathArray.map((path, index, arr) => {
    const currPath = arr.slice(0, index + 1).join('/')
    return getBreadcrumbSegment(currPath, findLink(currPath, flatLinks), path)
  })

  for (let i = 0; i < breadcrumbSegments.length; i++) {
    if (breadcrumbSegments[i].path && breadcrumbSegments[i].path === parseGlobalPrefix(config.urlMapping.globalPrefix)) {
      delete breadcrumbSegments[i].path
      break
    }
  }

  return breadcrumbSegments
}

function parseGlobalPrefix(str) {
  if (str.startsWith('/')) str = str.slice(1);  
  if (str.endsWith('/')) str = str.slice(0, -1);
  return str;
}

export const getHomeRoute = (config) => {
  return `/${parseGlobalPrefix(config.urlMapping.globalPrefix)}`
}

export const getPrevPage = (currPageIndex, flatLinks) => {
  for (let i = currPageIndex - 1; i >= 0; i--) {
    const page = flatLinks[i]
    if (page.url) return page;
  }

  return undefined
}

export const getNextPage = (currPageIndex, flatLinks) => {
  for (let i = currPageIndex + 1; i < flatLinks.length; i++) {
    const page = flatLinks[i]
    if (page.url) return page;
  }

  return undefined
}