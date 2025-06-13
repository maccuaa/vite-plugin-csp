import type { CspPluginConfiguration } from "csp-bun-cli";

export default {
  policy: {
    "style-src": ["'self'", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"],
  },
} as CspPluginConfiguration;
