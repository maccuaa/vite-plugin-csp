import { defineConfig } from "vite";
import { generateCsp } from "vite-plugin-bun-csp";

export default defineConfig({
  plugins: [
    generateCsp({
      algorithm: "sha384",
      policy: {
        // "default-src": ["'self'"],
        "font-src": ["fonts.gstatic.com"],
        "script-src": ["'self'", "'strict-dynamic'"],
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "fonts.googleapis.com"],
        "upgrade-insecure-requests": [],
      },
    }),
  ],
});
