import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [generateCspPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        about: resolve(root, "about/index.html"),
      },
    },
  },
});
