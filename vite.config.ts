import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: '0.0.0.0',
    port: 5137,   // hoặc đổi port nếu muốn
    strictPort: true,
    allowedHosts: ['binhvuong.id.vn'], // Thêm dòng này để cho phép host này
    open: true,
  },
});
