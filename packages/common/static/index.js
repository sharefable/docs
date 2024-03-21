import React, { Suspense } from 'react';
import Router from "./router";
import { BrowserRouter } from "react-router-dom";
import { hydrate, render } from "react-dom";
import { ApplicationContextProvider } from "./application-context";
import './root.css';
import './index.css';

const appElement = (
  <BrowserRouter>
    <ApplicationContextProvider>
      <Router />
    </ApplicationContextProvider>
  </BrowserRouter>
)

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  hydrate(appElement, rootElement);
} else {
  render(appElement, rootElement);
}