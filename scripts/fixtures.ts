import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { $ } from "bun";
import { type InlineConfig, type UserConfig, build, loadConfigFromFile, mergeConfig } from "vite";
import { generateCspPlugin } from "../packages/vite-bun/src";

export type Target = "bun-cli" | "bun-vite";

const loadViteConfig = async (path: string): Promise<UserConfig | null> => {
  const configPath = resolve(path, "vite.config.ts");

  const exists = await Bun.file(configPath).exists();

  if (!exists) {
    return null;
  }

  const result = await loadConfigFromFile({ command: "build", mode: "production" }, configPath, undefined, "info");

  return result?.config ?? null;
};

const buildFixture = async (projectRoot: string, env: Target) => {
  const outFile = resolve(projectRoot, "dist", env, "index.html");

  const defaultConfig: InlineConfig = {
    root: projectRoot,
    logLevel: "error",
    build: {
      emptyOutDir: true,
      outDir: `dist/${env}`,
    },
  };

  // Don't use the plugin if we're not using the Bun CLI CSP plugin
  const fallbackConfig: InlineConfig = {
    plugins: [env === "bun-vite" ? generateCspPlugin() : null],
  };

  const fixtureConfig = await loadViteConfig(projectRoot);

  const config = mergeConfig(defaultConfig, fixtureConfig ?? fallbackConfig, true);

  await build(config);

  return await Bun.file(outFile).text();
};

const runCliPlugin = async (entryPath: string, fixture: string, env: Target) => {
  const outFolder = resolve(entryPath, "dist", env);

  const configFilePath = resolve(entryPath, "csp.config.ts");

  const exists = await Bun.file(configFilePath).exists();

  await $`bun run ./packages/cli-bun/src/index.ts -d "${outFolder}" ${exists ? `-c "${configFilePath}"` : ""} ${fixture === "base-path" ? "-b base_path" : ""}`.quiet();
};

const fixturePath = resolve(__dirname, "../test/fixtures");

const fixtures = await readdir(fixturePath);

for (const env of ["bun-cli", "bun-vite"] as Target[]) {
  console.log("🏗️ ", env);
  console.log("=======");

  for (const fixture of fixtures) {
    const path = resolve(__dirname, "../test/fixtures", fixture);

    console.log("Building", fixture);

    await buildFixture(path, env);

    if (env === "bun-cli") {
      await runCliPlugin(path, fixture, env);
    }
  }
}
