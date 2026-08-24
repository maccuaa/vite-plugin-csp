# Vite Plugin CSP Bun

Vite Plugin for adding a Content Security Policy to your Vite application using the Bun runtime.

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP.
- 📚 Automatically detects and handles Google Fonts.
- 🏎 Zero dependencies. Uses Bun's built-in implementation of Cloudflare's [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) for parsing HTML.

## Installation

```bash
bun add -D vite-plugin-bun-csp
```

## Basic Usage

Add the meta CSP tag to the `<head>` of your `index.html` file:

```html
<head>
  <meta http-equiv="Content-Security-Policy" content="" />
</head>
```

Add the plugin to your Vite config

```ts
// vite.config.ts
import { defineConfig } from "vite";

import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  root: "src",
  build: {
    outDir: "build",
  },
  plugins: [generateCspPlugin()],
});
```

## Configuration (Optional)

**Note:** Setting a config is optional. If no config is provided, then the default values will be used.

You can also manually configure the CSP. Even when manually setting the CSP, the plugin will still analyze the HTML, generate the integrity hashes and, automatically add them to the policy.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  root: "src",
  build: {
    outDir: "build",
  },
  plugins: [
    generateCspPlugin({
      algorithm: "sha256",
      policy: {
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "upgrade-insecure-requests": [],
      },
    }),
  ],
});
```

## Multi-page apps

`vite-plugin-bun-csp` supports Vite's [multi-page app](https://vite.dev/guide/build.html#multi-page-app) pattern out of the box. Every HTML file that Vite emits (via `build.rollupOptions.input`) is automatically discovered and processed — no additional configuration needed. Each page gets its own independently-computed CSP and SRI `integrity` attributes.
