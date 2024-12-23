# vite-plugin-bun-csp

![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp)

TODO:

- README docs
- colorize output
  - see https://github.com/vite-pwa/vite-plugin-pwa/blob/main/src/log.ts
  - use ansis
- Node.js version (not Bun)
  - Make new package?
- Dont emit internal types in published package
  - Tried https://github.com/ryoppippi/bun-plugin-isolated-decl but it generated an invalid types.d.dts file. Try again in the future.

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
