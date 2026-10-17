import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    open: true,
    host: "0.0.0.0",
  },
  preview: {
    allowedHosts: ["admin.showe.biz"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
