import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  plugins: [
    generateCspPlugin({
      algorithm: "sha256",
    }),
  ],
});
