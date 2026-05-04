import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5137,
    strictPort: true,
    allowedHosts: ["binhvuong.id.vn"],
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    },
    open: true,
  },
});
