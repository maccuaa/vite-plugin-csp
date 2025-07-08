import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { $ } from "bun";
import { build, type InlineConfig, loadConfigFromFile, mergeConfig, type UserConfig } from "vite";
import { generateCspPlugin } from "../packages/vite-bun/src";

export type Target = "bun-cli" | "bun-vite";

/**
 * Load the Vite configuration file from the specified path.
 * @param path the path to the fixture project root
 * @returns the Vite configuration or null if it does not exist
 */
const loadViteConfig = async (path: string): Promise<UserConfig | null> => {
  const configPath = join(path, "_vite.config.ts");

  const exists = await Bun.file(configPath).exists();

  if (!exists) {
    return null;
  }

  const result = await loadConfigFromFile({ command: "build", mode: "production" }, configPath, undefined, "info");

  return result?.config ?? null;
};

/**
 * Use Vite to build the fixture project.
 *
 * Use Vite for both the Bun CLI and Bun Vite plugin so that there is a consistent output which can be compared in the unit tests.
 *
 * @param projectRoot the path to the fixture project root
 * @param target the target environment, either "bun-cli" or "bun-vite"
 * @returns the contents of the index.html file after building the fixture project
 */
const buildFixture = async (projectRoot: string, target: Target) => {
  const defaultConfig: InlineConfig = {
    root: projectRoot,
    logLevel: "error",
    build: {
      emptyOutDir: true,
      outDir: join("dist", target), // relative to the project root
    },
  };

  const fallbackConfig: InlineConfig = {
    plugins: [generateCspPlugin()],
  };

  const fixtureConfig = await loadViteConfig(projectRoot);

  const config = mergeConfig(defaultConfig, fixtureConfig ?? fallbackConfig, true);

  // If we're using the Bun CLI, we don't want to use the generateCspPlugin
  if (target === "bun-cli") {
    config.plugins = config.plugins.filter((plugin: { name?: string }) => plugin?.name !== "generate-csp");
  }

  await build(config);

  const outFile = join(projectRoot, "dist", target, "index.html");

  return await Bun.file(outFile).text();
};

const runCliPlugin = async (entryPath: string, fixture: string, target: Target) => {
  const outFolder = join(entryPath, "dist", target);

  const configFilePath = join(entryPath, "csp.config.ts");

  const configFileExists = await Bun.file(configFilePath).exists();

  // Bun shell command escaping is a little funky

  if (fixture === "base-path") {
    await $`bun run ./packages/cli-bun/src/index.ts --dir ${outFolder} --base base_path`;
  } else if (configFileExists) {
    await $`bun run ./packages/cli-bun/src/index.ts --dir ${outFolder} --config ${configFilePath}`;
  } else {
    await $`bun run ./packages/cli-bun/src/index.ts --dir ${outFolder}`;
  }

  const outFile = join(outFolder, "index.html");

  return await Bun.file(outFile).text();
};

const fixturePath = join(__dirname, "../test/fixtures");

const fixtures = await readdir(fixturePath);

for (const target of ["bun-cli", "bun-vite"] as Target[]) {
  console.log("🏗️ ", target);
  console.log("=======");

  for (const fixture of fixtures) {
    const path = resolve(__dirname, "../test/fixtures", fixture);

    console.log("Building", fixture);

    await buildFixture(path, target);

    if (target === "bun-cli") {
      await runCliPlugin(path, fixture, target);
    }
  }
}
