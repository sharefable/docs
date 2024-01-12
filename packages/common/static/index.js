import React from 'react';
import { createRoot } from "react-dom/client";
import Router from "./router";
import { BrowserRouter } from "react-router-dom";
import { ApplicationContextProvider } from "./application-context";
import './root.css';
import './index.css';
import { FallbackProvider } from './FallbackProvider';

createRoot(document.getElementById("root"))
  .render(
    <FallbackProvider>
        <BrowserRouter>
          <ApplicationContextProvider>      
            <Router />
          </ApplicationContextProvider>
        </BrowserRouter>
    </FallbackProvider>
  );