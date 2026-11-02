# AGENTS.md

This file provides context and guidance for AI coding agents working with this repository.

## Project Overview

This is a monorepo containing packages for adding Content Security Policy (CSP) to Single Page Applications (SPA). The project uses Bun as the JavaScript runtime and includes both a Vite plugin and a CLI tool.

### Key Packages

- **`vite-plugin-bun-csp`** (`packages/vite-bun/`) - Vite plugin for automatically generating CSP meta tags
- **`csp-bun-cli`** (`packages/cli-bun/`) - Command-line interface for CSP generation
- **`shared`** (`packages/shared/`) - Shared utilities and handlers used by both packages

## Technology Stack

- **Runtime**: Bun (version pinned by `packageManager` in the root `package.json`)
- **Build Tool**: Vite 7.x
- **Language**: TypeScript
- **Testing**: Bun test runner + Playwright for E2E tests
- **Linting**: Biome (lint only)
- **Formatting**: `bun fmt` (Bun's built-in formatter)
- **Package Manager**: Bun (uses `bun.lock`)

## Project Structure

```
/
├── packages/
│   ├── cli-bun/          # CLI package
│   ├── vite-bun/         # Vite plugin package
│   └── shared/           # Shared utilities and handlers
├── test/
│   ├── fixtures/         # Test fixtures for E2E tests
│   └── e2e/              # Playwright E2E tests
├── scripts/              # Build and utility scripts
└── playwright-report/    # Test report output
```

## Core Functionality

The packages automatically:

1. Calculate Subresource Integrity (SRI) hashes for JavaScript and CSS assets
2. Detect and handle Google Fonts in HTML
3. Insert computed hashes into CSP meta tags
4. Support configurable hash algorithms (SHA-256, SHA-384, SHA-512)
5. Process all HTML files in a build output — multi-page apps (MPA) are fully supported; every discovered page gets its own independently-computed CSP

### Key Components (packages/shared/)

- **`BaseHandler.ts`** - Base class for HTML element handlers
- **`BunFile.ts`** - File utilities using Bun's file system APIs
- **`BunHandler.ts`** - Main handler using Bun's HTMLRewriter
- **`BunHash.ts`** - Hashing utilities using Bun's crypto APIs
- **`ScriptHandler.ts`** - Handles `<script>` tags
- **`StyleHandler.ts`** - Handles `<link rel="stylesheet">` tags
- **`InlineScriptHandler.ts`** - Handles inline `<script>` content
- **`InlineStyleHandler.ts`** - Handles inline `<style>` content
- **`MetaHandler.ts`** - Handles CSP `<meta>` tags
- **`CspFile.ts`** - CSP configuration management
- **`Hasher.ts`** - Interface for hash implementations

## Development Commands

```bash
# Build all packages
bun run build

# Build test fixtures
bun run build_fixtures

# Clean build artifacts
bun run clean

# Lint code
bun run lint

# Format code
bun run format

# Check formatting without writing
bun run format:check

# Run unit tests
bun test

# Run E2E tests
bun run e2e
```

## Testing Strategy

1. **Unit Tests**: `test/index.test.ts` - Test core functionality
2. **E2E Tests**: `test/e2e/*.spec.ts` - Playwright tests covering:

   - Different hash algorithms (SHA-256, SHA-384, SHA-512)
   - Script handling (inline, local, external)
   - Style handling (inline, local, external)
   - Google Fonts integration
   - MUI/Emotion CSS compatibility
   - Base path handling
   - CSP policy configuration

3. **Test Fixtures**: `test/fixtures/*` - Sample applications used in E2E tests

## Important Patterns

### Zero Dependencies Philosophy

- Both packages have **0 runtime dependencies**
- Uses Bun's built-in APIs (HTMLRewriter, crypto, file system)
- Keeps packages lightweight and fast

### Monorepo Structure

- Uses Bun workspaces
- Shared code in `packages/shared`
- Private monorepo root package

### CSP Configuration

Users can optionally configure CSP policies in their Vite config:

```typescript
generateCspPlugin({
  algorithm: "sha256", // or "sha384", "sha512"
  policy: {
    "style-src": ["'self'", "'unsafe-inline'"],
    "script-src": ["'self'"],
    // ... other CSP directives
  },
});
```

## Special Cases

### Emotion CSS (MUI)

For Emotion/MUI users, recommend adding SHA-256 hash of empty string instead of `'unsafe-inline'`:

```
'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
```

### Google Fonts

Automatically detects and adds appropriate CSP directives for Google Fonts.

## Making Changes

### Adding New Features

1. Consider if it belongs in `shared/`, `vite-bun/`, or `cli-bun/`
2. Add corresponding tests in `test/` directory
3. Update relevant README.md files
4. Run `bun run lint` and `bun run format` before committing

### Modifying HTML Processing

- HTML parsing logic uses Bun's HTMLRewriter API
- Handler classes extend `BaseHandler`
- Each handler processes specific HTML elements

### Changing Hash Algorithms

- Hash implementations are in `BunHash.ts`
- Uses Bun's native crypto APIs
- Supported algorithms: SHA-256, SHA-384, SHA-512

## Build and Release

- Build scripts are in `scripts/` directory
- Uses `release-please` for automated releases (see `release-please-config.json`)
- Renovate is configured for dependency updates (see `renovate.json`)

## TypeScript Configuration

- Root `tsconfig.json` for overall project
- Each package has its own `tsconfig.json`
- Uses `@tsconfig/bun` as base configuration
- Type definitions in `packages/shared/types.d.ts` and `internal.d.ts`

## Code Quality

- **Linter**: Biome (configured in `biome.json`). Its formatter, import sorting and HTML linting are disabled
- **Formatter**: `bun fmt`, configured in the `[fmt]` section of `bunfig.toml`. It formats every supported file type (TypeScript, JSON, Markdown, HTML, YAML, TOML), sorts imports, and skips ignored files and the `CHANGELOG.md` files that release-please generates
  - Known issue: Bun's Markdown formatter drops the `?` from `{ a? }` in code fences ([oven-sh/bun#47744](https://github.com/oven-sh/bun/issues/47744)). Wrap such a block in `<!-- prettier-ignore -->`
- **Type Checking**: Bun's built-in type checker, run by `check: true` in the `Bun.build` call of `scripts/build.ts` (the same as `bun check`). There is no `typescript` dependency. For a quick check, run `bun check -p packages/vite-bun`
- **Type Declarations**: Generated by `bun-dts` during the build. The build fails if a `.d.ts` references the private `shared` package
- **Package Validation**: publint and @arethetypeswrong/cli

## Dependency Management

Dependencies are pinned to exact versions in the `package.json` of each workspace that uses them. Bun workspace catalogs are not used because Renovate doesn't support them, so the versions went stale.

- **Updating versions**: Renovate opens the PRs. To update by hand, change the version in every `package.json` that lists the dependency (for example `vite` is in the root and in `packages/vite-bun`) and run `bun install`
- **Bun version**: Pinned by `packageManager` in the root `package.json`. CI reads it through `oven-sh/setup-bun` and Renovate keeps it up to date. Use the same version locally, because the type checker and the formatter are built into Bun and change between releases

## Publishing

When publishing packages to npm, the workflow uses a two-step process:

1. **`bun pm pack`** - Creates a tarball (Bun resolves any `workspace:` or `catalog:` references to actual version numbers)
2. **`npm publish`** - Publishes the tarball with OIDC trusted publishing support (provenance attestations are automatic)

**Why this approach?**

- `bun pm pack` resolves `workspace:` and `catalog:` references to concrete versions in the published package
- `npm publish` provides OIDC trusted publishing support which `bun publish` doesn't currently support
- This maintains security (provenance attestations) while properly handling Bun-specific dependency protocols

The publish workflow is triggered by pushing tags matching the pattern `vite-plugin-bun-csp-*` or `csp-bun-cli-*`.

## Useful References

The README.md contains links to important CSP resources:

- [Web.dev Strict CSP Guide](https://web.dev/articles/strict-csp)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [W3C CSP Specification](https://www.w3.org/TR/CSP3/)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Common Tasks

### Adding a new CSP directive handler

1. Create handler in `packages/shared/`
2. Extend `BaseHandler` class
3. Add to `BunHandler.ts`
4. Add tests

### Adding a new test fixture

1. Create directory in `test/fixtures/`
2. Add minimal HTML and config
3. Create corresponding spec in `test/e2e/`
4. Update `scripts/fixtures.ts` if needed

### Debugging E2E tests

1. Run specific test: `bunx playwright test <test-file>`
2. Use Playwright inspector: `bunx playwright test --debug`
3. View report: Open `playwright-report/index.html`

## License

MIT - See LICENSE file for details.
