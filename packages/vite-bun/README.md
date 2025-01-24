# Vite Plugin CSP Bun

Vite Plugin for adding a Content Security Policy to your Vite application using the Bun runtime.

## Documentation

See docs [here](https://github.com/maccuaa/vite-plugin-csp).

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP.
- 📚 Automatically detects and handles Google Fonts.
- 🏎 Zero dependencies. Uses Bun's built-in implementation of Cloudflare's [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) for parsing HTML.

## Installation

```bash
bun add -D vite-plugin-bun-csp
```
