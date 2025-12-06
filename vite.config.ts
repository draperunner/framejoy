import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4444,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        short_name: "Framejoy",
        name: "Framejoy",
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
        icons: [
          {
            src: "logo-72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "logo-96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "logo-128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "logo-144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "logo-152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo-384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
