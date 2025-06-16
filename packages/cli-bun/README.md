# CSP Bun CLI

CLI app for adding a Content Security Policy to your SPA application using the Bun runtime.

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the CSP.
- 📚 Automatically detects and handles Google Fonts.
- 🏎 Uses Bun's built-in implementation of Cloudflare's [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) for parsing HTML.

## Installation

```bash
# Local project install
bun add -D csp-bun-cli

# Global install
bun add -g csp-bun-cli
```

## Basic Usage

Add the meta CSP tag to the `<head>` of your `index.html` file:

```html
<head>
  <meta http-equiv="Content-Security-Policy" content="" />
</head>
```

## Configuration (Optional)

**Note:** Setting a config is optional. If no config is provided, then the default values will be used.

Create a `csp.config.ts` file with your CSP configuration. The config must be exported as the default export.

```ts
import type { CspPluginConfiguration } from "csp-bun-cli";

export default {
  algorithm: "sha256",
  policy: {
    "script-src": ["'self'"],
  },
} as CspPluginConfiguration;
```

You can also explicitly specify a config file to use with the --config CLI option (resolved relative to `cwd`):

```bash
csp -d ./path/to/index.html --config ./my-config.ts
```

## Usage

```bash

# Basic Usage
csp -d path/to/index.html

# Custom Config
csp -d path/to/index.html --config path/to/config.ts

# Base Path
csp -d path/to/index.html --base myapp
```
