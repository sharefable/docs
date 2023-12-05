import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import Layout from "./Layout";
import config from './config.js'

createRoot(document.getElementById("root"))
  .render(
    <Suspense fallback={'Loading'}>
      <Layout config={config}>
        <RouterProvider router={router} />
      </Layout>
    </Suspense>
  );