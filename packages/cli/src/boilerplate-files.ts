export const indexJs = `import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import React, { Suspense } from 'react';
import { router } from "./router";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<Suspense fallback={'Loading'}><RouterProvider router={router} /></Suspense>);`


export const gitignore = `node_modules`