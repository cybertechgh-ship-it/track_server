import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 9041,
    proxy: {
      "/api": {
        target: "http://localhost:9040",
        changeOrigin: true,
      },
    },
    allowedHosts: ["localhost", "vehicle-tracking.yildizsalih.com"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
