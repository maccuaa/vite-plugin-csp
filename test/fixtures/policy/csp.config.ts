import type { CspPluginConfiguration } from "csp-bun-cli";

export default {
  policy: {
    "frame-src": ["'none'"],
  },
} as CspPluginConfiguration;
