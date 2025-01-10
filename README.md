# Vite Plugin CSP

Vite Plugin for adding a Content Security Policy to your Vite application.

| Library                | Version                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `vite-plugin-bun-csp`  | ![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp)  |
| `vite-plugin-node-csp` | ![NPM Version](https://img.shields.io/npm/v/vite-plugin-node-csp) |

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP
- 📚 Automatically detects and handles Google Fonts
- ⚡ Supports both Node.js and Bun runtimes
- 🏎 Fast and lightweight. Bun plugin has 0 dependencies. Node plugin has a single dependency.

## Installation

```bash
# Bun Plugin
npm i -D vite-plugin-bun-csp

# Node Plugin
npm i -D vite-plugin-node-csp
```

## Basic Usage

Let the plugin analyze the index.html file and automatically configure the CSP.

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

## Advanced Usage

You can also manually configure the CSP. Even when manually setting the CSP, the plugin will still analyze the HTML, generate the integrity hashes and automatically add them to the policy.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { DEFAULT_CSP_POLICY, generateCspPlugin } from "vite-plugin-bun-csp";

export default defineConfig({
  root: "src",
  build: {
    outDir: "build",
  },
  plugins: [
    generateCspPlugin({
      algorithm: "sha256",
      policy: {
        ...DEFAULT_CSP_POLICY,
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "upgrade-insecure-requests": [],
      },
    }),
  ],
});
```

#### Links

- https://web.dev/articles/strict-csp
- https://csp-evaluator.withgoogle.com/
- https://www.w3.org/TR/CSP3/
- https://html.spec.whatwg.org/multipage/semantics.html
- https://nuxt-security.vercel.app/advanced/strict-csp
- https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity

## License

MIT
