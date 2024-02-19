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
  margin: 0 auto;
}

.main-con {
  display: flex;
  flex-direction: column;
  flex: 3;
  width: 100%;
  min-width: 574px;
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
`;

export const appContext = `import React, { createContext, useContext, useState, useEffect } from "https://esm.sh/react@18.2.0";
import { useSearchParams } from "https://esm.sh/react-router-dom";
import manifest from './manifest.json'
import config from './config.json'
import sidePanelLinks from './link-tree.json'

const ApplicationContext = createContext(null);

const ApplicationContextProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [globalState, setGlobalState] = useState({});

  const [showSidePanel, setShowSidePanel] = useState(config.props.sidepanel.showSidePanel)

  const handleShowSidePanel = (updatedShowSidePanel) => {
    setShowSidePanel(config.props.sidepanel.showSidePanel && updatedShowSidePanel)
  }

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) handleShowSidePanel(true);
      else handleShowSidePanel(false);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const contextValue = {
    globalState,
    addToGlobalState,
    showSidePanel,
    handleShowSidePanel,
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
