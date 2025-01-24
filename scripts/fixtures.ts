import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type InlineConfig, type UserConfig, build, loadConfigFromFile, mergeConfig } from "vite";
import { generateCspPlugin as generateCspPluginBun } from "../packages/vite-bun/dist/index.js";
import { generateCspPlugin as generateCspPluginNode } from "../packages/vite-node/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = typeof Bun !== "undefined" ? "bun" : "node";

const loadConfig = async (path: string, env?: "bun" | "node"): Promise<UserConfig | null> => {
  try {
    const configPath = env ? resolve(path, `vite.${env}.config.ts`) : resolve(path, "vite.config.ts");

    await stat(configPath);

    const result = await loadConfigFromFile({ command: "build", mode: "production" }, configPath, undefined, "info");

    return result?.config ?? null;
  } catch (e) {
    if (env) {
      return await loadConfig(path);
    }
    return null;
  }
};

const buildVite = async (entryPath: string) => {
  const projectRoot = resolve(__dirname, entryPath);
  const outFile = resolve(projectRoot, "dist", env, "index.html");

  const plugin = env === "bun" ? generateCspPluginBun : generateCspPluginNode;

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
    plugins: [plugin()],
  };

  const fixtureConfig = await loadConfig(projectRoot, env);

  const config = mergeConfig(defaultConfig, fixtureConfig ?? fallbackConfig, true);

  await build(config);

  return await readFile(outFile, "utf8");
};

const fixturePath = resolve(__dirname, "../test/fixtures");

const fixtures = await readdir(fixturePath);

console.log("🏗️ ", env);
console.log("=======");

for (const fixture of fixtures) {
  const path = resolve(__dirname, "../test/fixtures", fixture);

  console.log("Building", fixture);

  await buildVite(path);
}
