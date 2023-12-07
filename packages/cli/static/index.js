import React, { Suspense } from 'react';
import { createRoot } from "react-dom/client";
import Router from "./router";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root"))
  .render(
    <Suspense fallback={'Loading'}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
    </Suspense>
  );