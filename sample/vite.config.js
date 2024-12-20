import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  plugins: [
    generateCspPlugin({
      algorithm: "sha256",
      policy: {
        "default-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'none'"],
        "script-src": ["'strict-dynamic'"],

        "img-src": ["'self'", "data:"],
        "upgrade-insecure-requests": [],
      },
    }),
  ],
});
