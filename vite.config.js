import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/",
  build: {
    outDir: 'docs' // zmienia katalog z 'dist' na 'docs'
},
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.tripstep.website",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    ssr: false
  },
  optimizeDeps: {
    include: ['fast-deep-equal']
  },
 
  

});
