import * as React from "react";
import { createRoot } from "react-dom/client";
import { ColorModeScript } from "@chakra-ui/react";
import { PostHogProvider } from "posthog-js/react";

import { App } from "./App";

const element = document.getElementById("root");
if (element) {
  createRoot(element).render(
    <React.StrictMode>
      <ColorModeScript />
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: "2025-05-24",
          persistence: "memory",
        }}
      >
        <App />
      </PostHogProvider>
    </React.StrictMode>,
  );
}
