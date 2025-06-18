import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  plugins: [
    generateCspPlugin({
      algorithm: "sha512",
    }),
  ],
});
