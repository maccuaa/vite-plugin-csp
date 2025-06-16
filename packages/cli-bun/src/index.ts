#!/usr/bin/env bun

import { join } from "node:path";
import { Command } from "@commander-js/extra-typings";
import { handler } from "shared/BunHandler";
import type { Config } from "shared/internal";
export type { CspPluginConfiguration } from "shared/types";
import { BunFile } from "shared/BunFile";
import { BunHash } from "shared/BunHash";
import type { CspPluginConfiguration } from "shared/types";
import { DEFAULT_CSP_POLICY } from "shared/utils";
import { description, name, version } from "../package.json";

const program = new Command();

const resolveConfig = async (configFilePath: string): Promise<CspPluginConfiguration> => {
  const exists = await Bun.file(configFilePath).exists();

  if (exists) {
    const imported = await import(configFilePath);

    return imported?.default as CspPluginConfiguration;
  }

  return {
    algorithm: "sha384",
    policy: DEFAULT_CSP_POLICY,
  };
};

program
  .name(name)
  .description(description)
  .version(version)
  .requiredOption("-d, --dir <directory>", "Directory with the HTML file to process.")
  .option("-c, --config <file>", "Path to config file.")
  .option("-b, --base <path>", "Base public path of your SPA.", "")
  .action(async ({ base, dir, config }) => {
    const configFilePath: string = config?.trim() ?? join(process.cwd(), "csp.config.ts");

    const options = await resolveConfig(configFilePath);

    const { algorithm = "sha384", policy = DEFAULT_CSP_POLICY } = options;

    const pluginConfig: Config = {
      base,
      outDir: "",
      root: dir,
    };

    await handler({ algorithm, config: pluginConfig, policy, BunFile, BunHash });
  });

program.parse();
