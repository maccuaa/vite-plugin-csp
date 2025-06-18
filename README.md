# Content Security Policy Helpers

Packages for adding a Content Security Policy to your SPA applications:

| Library               | Version                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `vite-plugin-bun-csp` | ![NPM Version](https://img.shields.io/npm/v/vite-plugin-bun-csp) |
| `csp-bun-cli`         | ![NPM Version](https://img.shields.io/npm/v/csp-bun-cli)         |

## Features

- ✨ Automatically calculates Subresource Integrity (SRI) hashes of JavaScript and CSS assets and adds them to the meta Content Security Policy (CSP) directive in your HTML.
- 📚 Automatically detects and handles Google Fonts.
- 🏎 Fast and lightweight. Packages contain 0 dependencies.

## Documentation

- [Vite Plugin](https://github.com/maccuaa/vite-plugin-csp/tree/main/packages/vite-bun)
- [CLI](https://github.com/maccuaa/vite-plugin-csp/tree/main/packages/cli-bun)

## Library / Framework Specific Guidance

### Emotion CSS

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
