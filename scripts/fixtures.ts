import { exec } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { type InlineConfig, type UserConfig, build, loadConfigFromFile, mergeConfig } from "vite";
import { generateCspPlugin as generateCspPluginBun } from "../packages/vite-bun/dist/index.js";
import { generateCspPlugin as generateCspPluginNode } from "../packages/vite-node/dist/index.js";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Env = "bun" | "node" | "cli-bun";

const getEnv = (): Env => {
  const args = process.argv.slice(2);
  if (args.includes("cli-bun")) {
    return "cli-bun";
  }
  return typeof Bun !== "undefined" ? "bun" : "node";
};

const env: Env = getEnv();

const loadConfig = async (path: string, env?: Env): Promise<UserConfig | null> => {
  try {
    const configPath = env === "cli-bun" ? resolve(path, "vite.config.ts") : resolve(path, `vite.${env}.config.ts`);

    await stat(configPath);

    const result = await loadConfigFromFile({ command: "build", mode: "production" }, configPath, undefined, "info");

    return result?.config ?? null;
  } catch (e) {
    return null;
  }
};

const buildVite = async (entryPath: string) => {
  const projectRoot = resolve(__dirname, entryPath);
  const outFile = resolve(projectRoot, "dist", env, "index.html");

  const plugin = env === "cli-bun" ? undefined : env === "bun" ? generateCspPluginBun : generateCspPluginNode;

  const defaultConfig: InlineConfig = {
    root: projectRoot,
    logLevel: "error",
    build: {
      emptyOutDir: true,
      outDir: `dist/${env}`,
    },
  };

  const fallbackConfig: InlineConfig = {
    // @ts-ignore - unable to import directory as a package in Node.js
    plugins: [plugin ? plugin() : undefined],
  };

  const fixtureConfig = await loadConfig(projectRoot, env);

  const config = mergeConfig(defaultConfig, fixtureConfig ?? fallbackConfig, true);

  await build(config);

  return await readFile(outFile, "utf8");
};

const runCli = async (entryPath: string, fixture: string) => {
  const outFolder = resolve(entryPath, "dist", env);

  // check if csp.config.ts exists
  const configFilePath = resolve(entryPath, "csp.config.ts");
  const exists = await stat(configFilePath)
    .then(() => true)
    .catch(() => false);

  // execute the following shell command with node
  const bunCommand = `bun run ./packages/cli-bun/src/index.ts -d "${outFolder}" ${exists ? `-c "${configFilePath}"` : ""} ${fixture === "base-path" ? "-b base_path" : ""}`;

  const { stderr } = await execAsync(bunCommand);

  if (stderr) {
    console.error("CLI Bun error:", stderr);
    process.exit(1);
  }
};

const fixturePath = resolve(__dirname, "../test/fixtures");

const fixtures = await readdir(fixturePath);

console.log("🏗️ ", env);
console.log("=======");

for (const fixture of fixtures) {
  const path = resolve(__dirname, "../test/fixtures", fixture);

  console.log("Building", fixture);

  await buildVite(path);

  if (env === "cli-bun") {
    console.log("Running Bun CSP CLI:", fixture);

    await runCli(path, fixture);
  }
}
