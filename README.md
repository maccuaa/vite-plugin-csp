# Vite Plugin CSP

Vite Plugin for adding a Content Security Policy to your Vite SPA application.

| Library                | Version                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `vite-plugin-bun-csp`  | ![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp)  |
| `vite-plugin-node-csp` | ![NPM Version](https://img.shields.io/npm/v/vite-plugin-node-csp) |

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP.
- 📚 Automatically detects and handles Google Fonts.
- ⚡ Supports both Node.js and Bun runtimes.
- 🏎 Fast and lightweight. Bun plugin has 0 dependencies. Node plugin has a single dependency.

## Installation

**❗ Install the correct plugin for the runtime you are using!**

```bash
# Bun Plugin
npm i -D vite-plugin-bun-csp

# Node Plugin
npm i -D vite-plugin-node-csp
```

## Basic Usage

Add the meta CSP tag to the `<head>` of your `index.html` file:

```html
<head>
  <meta http-equiv="Content-Security-Policy" content="" />
</head>
```

Let the plugin analyze the index.html file and automatically configure the CSP. The CSP will be injected into the meta tag.

```ts
// vite.config.ts
import { defineConfig } from "vite";

// Bun
import { generateCspPlugin } from "vite-plugin-bun-csp";

// Node
import { generateCspPlugin } from "vite-plugin-node-csp";

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

### Library / Framework Specific Guidance

#### Emotion CSS

If you are using the [Emotion](https://emotion.sh/) CSS library, which [MUI](https://mui.com/) uses by default, then you can add the SHA-256 hash of an empty string `'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='` to your CSP rather than setting `'unsafe-inline'` in your `style-src` directive.

```ts
generateCspPlugin({
  policy: {
    "style-src": ["'self'", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"],
  },
}),
```

Source: https://github.com/emotion-js/emotion/issues/2996#issuecomment-1440609591

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
