import * as React from "react";
import { createRoot } from "react-dom/client";
import { ColorModeScript } from "@chakra-ui/react";

import { App } from "./App";

const element = document.getElementById("root");
if (element) {
  createRoot(element).render(
    <React.StrictMode>
      <ColorModeScript />
      <App />
    </React.StrictMode>,
  );
}
