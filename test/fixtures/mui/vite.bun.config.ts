import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  plugins: [
    react(),
    generateCspPlugin({
      policy: {
        "style-src": ["'self'", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"],
      },
    }),
  ],
});
