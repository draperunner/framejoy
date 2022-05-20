import * as React from "react";
import { createRoot } from "react-dom/client";
import { ColorModeScript } from "@chakra-ui/react";

import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";

const element = document.getElementById("root");
if (element) {
  createRoot(element).render(
    <React.StrictMode>
      <ColorModeScript />
      <App />
    </React.StrictMode>
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
