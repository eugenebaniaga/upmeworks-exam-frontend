import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "upmeworks-exam-backend.railway.internal",
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip ALL TypeScript and other warnings
        if (warning.code) return;
        warn(warning);
      },
    },
    outDir: "./dist",
  },
});

