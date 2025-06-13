import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-node-csp";

export default defineConfig({
  base: "base_path",
  plugins: [generateCspPlugin()],
});
