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
    {
      name: "serve-parkshare-spa",
      configureServer(server) {
        const handler = (req: any, _res: any, next: () => void) => {
          const url = req.url ?? "";
          if (
            (url === "/parkshare" || url === "/parkshare/" || url.startsWith("/parkshare/")) &&
            !url.startsWith("/parkshare/api")
          ) {
            req.url = url === "/parkshare" || url === "/parkshare/" ? "/" : "/" + url.slice("/parkshare".length);
          }
          next();
        };
        // Вставляем в начало, чтобы /parkshare и /parkshare/ отдавали SPA до проверки proxy/static
        (server.middlewares as any).stack.unshift({ route: "", handle: handler });
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
     * Проксируем только /parkshare/api, чтобы по /parkshare и /parkshare/#terms отдавалась SPA.
     */
    proxy: {
      "/parkshare/api": {
        target: "https://test-app-iuwehfvnlw23275vb.koalanearby.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
