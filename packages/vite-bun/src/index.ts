import { join } from "node:path";
import { BunFile } from "shared/BunFile";
import { handler } from "shared/BunHandler";
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
    writeBundle: {
      order: "post",
      handler: async (options, bundle) => {
        const outDir = options.dir;

        const htmlPaths = Object.values(bundle)
          .filter((entry) => entry.fileName.endsWith(".html"))
          .map((entry) => join(outDir ?? config.root, entry.fileName));

        const policy = { ...startingPolicy };

        await handler({ algorithm, config, policy, BunFile, BunHash, htmlPaths });
      },
    },
  };
};
