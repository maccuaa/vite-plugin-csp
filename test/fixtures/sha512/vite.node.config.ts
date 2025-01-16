import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-node-csp";

export default defineConfig({
  plugins: [
    react(),
    generateCspPlugin({
      algorithm: "sha512",
    }),
  ],
});
