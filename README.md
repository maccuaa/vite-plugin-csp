# vite-plugin-bun-csp

![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp)

TODO:

- README docs
- tests
- support CSS
- support calculate SHA of remote resources? security risk?
- support reading and updating an existing meta tag CSP value?

## About

This plugin is useful for when you want to generate an SBOM or scan your project for vulnerable Open Source libraries but you don't want to include libraries which aren't included in your final production bundle. Many libraries miscategorize their dependencies (`dependency` vs `devDepdency`) which leads to many libraries appearing in production NPM audit reports etc even though the library isn't included in the final production build.

## Installation

```bash
# npm
npm i -D vite-plugin-bun-csp
```

## Usage

```js
// vite.config.ts
import { defineConfig } from "vite";
import { generatePackageJson } from "vite-plugin-bun-csp";

export default defineConfig({
  root: "src",
  build: {
    outDir: "build",
  },
  plugins: [generatePackageJson()],
});
```

### Configuration

There are some useful options, all of them are optional:

#### outputDir

Type: `string`
Default: `build`

Set the output directory where the `package.json` and `package-lock.json` files will be written to.

```js
generatePackageJson({
  outputDir: "dist",
});
```

## License

MIT
