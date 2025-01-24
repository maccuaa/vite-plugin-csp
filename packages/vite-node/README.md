# Vite Plugin CSP Node

Vite Plugin for adding a Content Security Policy to your Vite application using the Node.js runtime.

## Documentation

See docs [here](https://github.com/maccuaa/vite-plugin-csp).

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP.
- 📚 Automatically detects and handles Google Fonts.
- 🏎 Single dependency. Uses`@miniflare/html-rewriter`, a WASM build of Cloudflare's [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) for parsing HTML.

## Installation

```bash
npm i -D vite-plugin-node-csp
```
