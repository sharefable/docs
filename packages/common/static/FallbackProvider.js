import * as React from 'react';

export const FallbackContext = React.createContext({
  updateFallback: () => {},
});


export const FallbackProvider = ({
  children,
}) => {
  const [fallback, setFallback] = React.useState(null);

  const updateFallback = React.useCallback((fallback) => {
    setFallback(() => fallback);
  }, []);

  const renderChildren = React.useMemo(() => {
    return children;
  }, [children]);

  return (
    <FallbackContext.Provider value={{ updateFallback }}>
      <React.Suspense fallback={fallback}>{renderChildren}</React.Suspense>
    </FallbackContext.Provider>
  );
};
