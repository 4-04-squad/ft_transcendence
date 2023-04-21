import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: "0.0.0.0",
    port: 3003,
    proxy: {
      '/ws': {
        target: 'http://localhost/api', // <-- Change this to match your backend URL
        ws: true,
      },
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
