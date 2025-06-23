#!/usr/bin/env bun

import { join, resolve } from "node:path";
import { handler } from "shared/BunHandler";
import type { Config } from "shared/internal";

export type { CspPluginConfiguration } from "shared/types";

import { pathToFileURL } from "bun";
import { BunFile } from "shared/BunFile";
import { BunHash } from "shared/BunHash";
import type { CspPluginConfiguration } from "shared/types";
import { DEFAULT_CSP_POLICY } from "shared/utils";
import { name, version } from "../package.json";

interface ProgramOptions {
  dir: string;
  config?: string;
  base?: string;
}

const helpText = `
Usage: csp [options]

A CLI that generates and injects a Content Security Policy (CSP) for your SPA application.

Options:
  -V, --version          output the version number
  -d, --dir <directory>  Directory with the HTML file to process. Mandatory.
  -c, --config <file>    Path to CSP config file. (default: "csp.config.ts")
  -b, --base <path>      Base public path of your SPA. (default: "")
  -h, --help             display help for command
`;

const resolveConfig = async (configFilePath: string): Promise<CspPluginConfiguration> => {
  const exists = await Bun.file(configFilePath).exists();

  if (exists) {
    const imported = await import(pathToFileURL(configFilePath).href);

    return imported?.default as CspPluginConfiguration;
  }

  return {
    algorithm: "sha384",
    policy: DEFAULT_CSP_POLICY,
  };
};

const infoLog = (message: string): void => {
  console.info(message);
  process.exit(0);
};

const fatalError = (message: string): never => {
  console.error(`Error: ${message}`);
  console.log("Use -h or --help to see available options.");
  process.exit(1);
};

const parseAgs = (): Required<ProgramOptions> => {
  const config: Required<ProgramOptions> = {
    base: "",
    dir: "",
    config: join(process.cwd(), "csp.config.ts"), // Default config file path
  };

  const args = Bun.argv
    .slice(2)
    .reduce((acc, arg) => {
      if (arg.includes("=")) {
        const [key, value] = arg.split("=");
        acc.push(key ?? "", value ?? "");
      } else {
        acc.push(arg);
      }
      return acc;
    }, [] as string[])
    .filter((arg) => arg.trim() !== "");

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-d":
      case "--dir": {
        const value = args[i + 1];
        if (value) {
          config.dir = resolve(value.trim());
          i++;
        } else {
          fatalError("Directory argument is missing a value.");
        }
        break;
      }
      case "-c":
      case "--config": {
        const configValue = args[i + 1];
        if (configValue) {
          config.config = configValue.trim();
          i++;
        } else {
          fatalError("Config file argument is missing a value.");
        }
        break;
      }
      case "-b":
      case "--base": {
        const baseValue = args[i + 1];
        if (baseValue) {
          config.base = baseValue.trim();
          i++;
        }
        break;
      }
      case "-h":
      case "--help": {
        infoLog(helpText);
        break;
      }
      case "-V":
      case "--version": {
        infoLog(`${name} v${version}`);
        break;
      }
      default: {
        console.warn(`Unknown argument: ${arg}`);
        break;
      }
    } // end switch
  } // end for loop

  // Process required arguments
  if (!config.dir) {
    fatalError("Directory argument is required. Use -d or --dir to specify the directory.");
  }

  return config;
};

const { dir, base, config } = parseAgs();

const cspConfig = await resolveConfig(config);

const { algorithm = "sha384", policy = DEFAULT_CSP_POLICY } = cspConfig;

const pluginConfig: Config = {
  base,
  outDir: "",
  root: dir,
};

await handler({ algorithm, config: pluginConfig, policy, BunFile, BunHash });
