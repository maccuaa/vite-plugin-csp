import { handler } from "shared/BunHandler";

import type { Config } from "shared/internal";
import type { CspPluginConfiguration, generateCspPlugin as GenerateCspPlugin } from "shared/types";
import { DEFAULT_CSP_POLICY } from "shared/utils";
import type { PluginOption } from "vite";
import { BunFile } from "./BunFile";
import { BunHash } from "./BunHash";

export { DEFAULT_CSP_POLICY };

/**
 *
 * @param options
 * @returns
 */
export const generateCspPlugin: typeof GenerateCspPlugin = (options: CspPluginConfiguration = {}): PluginOption => {
  const { algorithm = "sha384" } = options;

  const startingPolicy = options.policy ?? { ...DEFAULT_CSP_POLICY };
  let config: Config;

  return {
    name: "generate-csp",
    enforce: "post",
    apply: "build",
    configResolved: ({ root, base, build: { outDir } }) => {
      config = {
        base,
        outDir,
        root,
      };
    },
    closeBundle: {
      order: "post",
      handler: () => {
        const policy = { ...startingPolicy };
        handler({ algorithm, config, policy, BunFile, BunHash });
      },
    },
  };
};
