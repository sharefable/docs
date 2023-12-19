import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import React, { Suspense } from 'react';
import { router } from "./router";

createRoot(document.getElementById("root"))
  .render(
    <Suspense fallback={'Loading'}>
      <RouterProvider router={router} />
    </Suspense>
  );