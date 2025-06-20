import { handler } from "shared/BunHandler";

import { BunFile } from "shared/BunFile";
import { BunHash } from "shared/BunHash";
import type { Config } from "shared/internal";
import type { CspPluginConfiguration } from "shared/types";
import { DEFAULT_CSP_POLICY } from "shared/utils";
import type { PluginOption } from "vite";

/**
 *
 * @param options
 * @returns
 */
export const generateCspPlugin = (options: CspPluginConfiguration = {}): PluginOption => {
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
