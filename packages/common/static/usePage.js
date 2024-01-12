import * as React from 'react';
import { FallbackContext } from './FallbackProvider';

export const usePage = () => {
  const { updateFallback } = React.useContext(FallbackContext);

  const onLoad = React.useCallback(
    (component) => {
      if (component === undefined) component = null;
      updateFallback(component);
    },
    [updateFallback]
  );

  return { onLoad };
};
