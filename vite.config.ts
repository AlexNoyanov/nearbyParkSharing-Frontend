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
});
