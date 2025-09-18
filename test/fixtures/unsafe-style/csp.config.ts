import type { CspPluginConfiguration } from "csp-bun-cli";

export default {
  policy: {
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  },
} as CspPluginConfiguration;
