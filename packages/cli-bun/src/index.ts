#!/usr/bin/env bun

import { join, resolve } from "node:path";
import { Glob } from "bun";
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
  dir?: string;
  config?: string;
  base?: string;
  pattern?: string;
}

const helpText = `
Usage: csp [options]

A CLI that generates and injects a Content Security Policy (CSP) for your SPA application.

Options:
  -V, --version          output the version number
  -d, --dir <directory>  Directory with the HTML file to process. (default: ".")
  -c, --config <file>    Path to CSP config file. (default: "csp.config.ts")
  -b, --base <path>      Base public path of your SPA. (default: "")
  -p, --pattern <glob>   Glob pattern (relative to --dir) used to find HTML files. (default: "**/*.html")
  -h, --help             display help for command
`;

const resolveConfig = async (configFilePath: string): Promise<CspPluginConfiguration> => {
  const exists = await Bun.file(configFilePath).exists();

  if (!exists) {
    return {
      algorithm: "sha384",
      policy: DEFAULT_CSP_POLICY,
    };
  }

  try {
    const imported = await import(pathToFileURL(configFilePath).href);

    if (!imported?.default) {
      fatalError(`Config file ${configFilePath} does not have a default export.`);
    }

    return imported.default as CspPluginConfiguration;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Config file")) {
      throw error; // re-throw fatalError's own path if it somehow didn't exit
    }
    return fatalError(
      `Failed to load config file ${configFilePath}: ${error instanceof Error ? error.message : error}`,
    );
  }
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
    dir: process.cwd(), // Default to current working directory
    config: join(process.cwd(), "csp.config.ts"), // Default config file path
    pattern: "**/*.html", // Default glob pattern for finding HTML files
  };

  // Parse command line arguments into an array of strings
  // This will handle both key-value pairs (e.g., --key=value) and standalone arguments (e.g., --key value)
  // It will also filter out any empty strings
  // and trim whitespace from values.
  // Example: ["-d", "/path/to/dir", "-c", "custom.config.ts", "--base", "/public", "-h"]
  // will be parsed into: ["-d", "/path/to/dir", "-c", "custom.config.ts", "--base", "/public", "-h"]
  // and will be processed accordingly.
  // This allows for flexible argument passing and ensures that all arguments are captured correctly.
  // Note: Bun.argv is an array of strings representing the command line arguments passed to the script.
  // The first two elements are the node executable and the script path, so we slice
  // from index 2 to get only the user-defined arguments.
  // This is similar to how many CLI tools handle arguments.
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
      case "-p":
      case "--pattern": {
        const patternValue = args[i + 1];
        if (patternValue) {
          config.pattern = patternValue.trim();
          i++;
        } else {
          fatalError("Pattern argument is missing a value.");
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

  return config;
};

const { dir, base, config, pattern } = parseAgs();

const cspConfig = await resolveConfig(config);

const { algorithm = "sha384", policy = DEFAULT_CSP_POLICY } = cspConfig;

const pluginConfig: Config = {
  base,
  outDir: "",
  root: dir,
};

const glob = new Glob(pattern);
const htmlPaths: string[] = [];

for await (const file of glob.scan({ cwd: pluginConfig.root })) {
  htmlPaths.push(join(pluginConfig.root, file));
}

if (htmlPaths.length === 0) {
  fatalError(`No HTML files found in ${pluginConfig.root} matching pattern "${pattern}"`);
}

try {
  await handler({ algorithm, config: pluginConfig, policy, BunFile, BunHash, htmlPaths });
} catch (error) {
  fatalError(`Failed to generate CSP: ${error instanceof Error ? error.message : error}`);
}
