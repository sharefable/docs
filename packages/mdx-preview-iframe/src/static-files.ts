export const indexCss = `html {
  font-size: var(--font-size);
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-family);
  line-height: var(--line-height);
  background-color: var(--background-primary-color);
  color: var(--text-primary-color);
}

a {
  text-decoration: none;
  color: var(--text-tertiary-color);
  line-height: var(--line-height);
}

blockquote {
  border-left: 5px solid var(--accent-color);
  padding: 10px 20px;
  margin: 0 0 10px 0;
}

a:hover {
  background-color: var(--accent-color);
}

a:active {
  color: var(--primary-color);
}

h1 {
  margin: var(--h1-margin);
  padding: var(--h1-padding);
  font-size: var(--h1-font-size);
  line-height: var(--h1-line-height);
  font-weight: var(--h1-font-weight);
}

h2 {
  margin: var(--h2-margin);
  padding: var(--h2-padding);
  font-size: var(--h2-font-size);
  line-height: var(--h2-line-height);
  font-weight: var(--h2-font-weight);
}

h3 {
  margin: var(--h3-margin);
  padding: var(--h3-padding);
  font-size: var(--h3-font-size);
  line-height: var(--h3-line-height);
  font-weight: var(--h3-font-weight);
}

h4 {
  margin: var(--h4-margin);
  padding: var(--h4-padding);
  font-size: var(--h4-font-size);
  line-height: var(--h4-line-height);
  font-weight: var(--h4-font-weight);
}

h5 {
  margin: var(--h5-margin);
  padding: var(--h5-padding);
  font-size: var(--h5-font-size);
  line-height: var(--h5-line-height);
  font-weight: var(--h5-font-weight);
}

h6 {
  margin: var(--h6-margin);
  padding: var(--h6-padding);
  font-size: var(--h6-font-size);
  line-height: var(--h6-line-height);
  font-weight: var(--h6-font-weight);
}

p, li {
  margin: var(--p-margin);
  padding: var(--p-padding);
  font-size: var(--p-font-size);
  line-height: var(--p-line-height);
  font-weight: var(--p-font-weight);
}

.con {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.main-wrapper {
  scroll-margin-top: 100px;
  display: flex;
  flex-grow: 1;
  align-items: stretch;
  min-height: 100vh;
  max-width: 1280px;
}

.main-con {
  display: flex;
  flex-direction: column;
  flex: 3;
  width: 100%;
}

.content-wrapper {
  flex: 1;
  padding: 1rem;
}

.content-wrapper img {
  max-width: 100%;
}

.content-wrapper a {
  color: var(--primary-color);
}

h1 a,
h2 a,
h3 a,
h4 a,
h5 a,
h6 a {
  background-color: transparent !important;
}


h1,
h2,
h3,
h4,
h5,
h6 {
  scroll-margin-top: 6.9rem;
}

a .icon {
  opacity: 0;
  transition: all 0.2s ease-in;
}

a .icon:hover {
  opacity: 1;
}

a .icon-link::after {
  content: '🔗';
  font-size: 1rem;
  vertical-align: middle;
}


@media only screen and (min-width: 768px) {
  .main-wrapper {
    margin: 0 auto;
  }

  .main-con {
    min-width: 574px;
  }
}`;

export const appContext = `import React, { createContext, useContext, useState, useEffect } from "https://esm.sh/react@18.2.0";
import { useSearchParams } from "https://esm.sh/react-router-dom";
import manifest from './manifest.json'
import config from './config.json'
import sidePanelLinks from './link-tree.json'

const ApplicationContext = createContext(null);

const ApplicationContextProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [globalState, setGlobalState] = useState({});

  const updateUrlParams = (key, value) => {
    setSearchParams((prev) => {
      return {
        ...decodeSearchParams(prev),
        [key]: typeof value === "object" ? JSON.stringify(value) : value,
      };
    });
  };

  const addToGlobalState = (key, value, type = "url") => {
    if (type === "url") {
      updateUrlParams(key, value);
    }
    setGlobalState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setGlobalState((prev) => ({ ...prev, ...decodeSearchParams(searchParams) }))
  }, [searchParams]);


  const contextValue = {
    globalState,
    addToGlobalState,
    config,
    manifest,
    sidePanelLinks
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};

const useApplicationContext = () => {
  return useContext(ApplicationContext);
};

export {useApplicationContext, ApplicationContextProvider}

const decodeSearchParams = (searchParams) => {
    return [...searchParams.entries()].reduce((acc, [key, val]) => {
      if (typeof val === "object") {
        try {
          return {
            ...acc,
            [key]: JSON.parse(val),
          };
        } catch {
          return {
            ...acc,
            [key]: val,
          };
        }
      } else {
        return {
          ...acc,
          [key]: val,
        };
      }
    }, {});
  };
  `;

export const utilsJS = `export const flattenObject = (obj, result = []) => {
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
  return \`/\${parseGlobalPrefix(config.urlMapping.globalPrefix)}\`
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
}`;
