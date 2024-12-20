# vite-plugin-bun-csp

![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp)

TODO:

- README docs
- Stand-alone mode / package?
- tests

#### Links

- https://web.dev/articles/strict-csp
- https://csp-evaluator.withgoogle.com/
- https://www.w3.org/TR/CSP3/
- https://html.spec.whatwg.org/multipage/semantics.html
- https://nuxt-security.vercel.app/advanced/strict-csp
- https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity

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
