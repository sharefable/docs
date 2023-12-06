import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import Router from "./router";
import Layout from "./Layout";
import config from './config.js'
import { BrowserRouter } from "react-router-dom";


createRoot(document.getElementById("root"))
  .render(
    <Suspense fallback={'Loading'}>
      <Layout config={config}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </Layout>
    </Suspense>
  );