import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        const timestamp = Date.now();
        const version = `v${timestamp}`;
        return html
          .replace(
            "<title>parksharing</title>",
            `<title>parksharing</title>\n    <meta name="build-timestamp" content="${timestamp}" />\n    <meta name="app-version" content="${version}" />`
          )
          .replace(
            '<script type="module" src="/src/main.ts"></script>',
            `<script type="module" src="/src/main.ts?${version}"></script>`
          );
      },
    },
  ],
  define: {
    // Polyfill for Node.js 'global' variable used by sockjs-client
    global: 'globalThis',
  },
  server: {
    /**
     * Dev-only proxy to bypass backend CORS during local development.
     * Frontend calls /parkshare/... (same-origin), Vite forwards to backend.
     */
    proxy: {
      "/parkshare": {
        target: "https://test-app-iuwehfvnlw23275vb.koalanearby.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
