import { DEFAULT_CSP_POLICY } from "shared/utils";
import type { CspPluginConfiguration } from "vite-plugin-bun-csp";

export const defineConfig = (config: CspPluginConfiguration) => {
  return {
    ...DEFAULT_CSP_POLICY,
    ...config,
  };
};
