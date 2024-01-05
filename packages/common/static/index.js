import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import Router from "./router";
import { BrowserRouter } from "react-router-dom";
import { ApplicationContextProvider } from "./application-context";
import './root.css';
import './index.css';

createRoot(document.getElementById("root"))
  .render(
    <Suspense fallback={'Loading'}>
        <BrowserRouter>
          <ApplicationContextProvider>      
            <Router />
          </ApplicationContextProvider>
        </BrowserRouter>
      </Suspense>
  );