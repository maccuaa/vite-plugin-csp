import { dirname, resolve } from "node:path";
import { build } from "vite";
import type { CspPluginConfiguration, HashAlgorithm } from "../packages/bun/dist/types.js";

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { generateCspPlugin as generateCspPluginBun } from "../packages/bun/dist/index.js";
import { generateCspPlugin as generateCspPluginNode } from "../packages/node/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildVite(entryPath: string, env: "node" | "bun", pluginConfig?: CspPluginConfiguration, base?: string) {
  const projectRoot = resolve(__dirname, entryPath);
  const outFile = resolve(projectRoot, "dist", env, "index.html");

  const plugin = env === "bun" ? generateCspPluginBun : generateCspPluginNode;

  await build({
    root: projectRoot,
    logLevel: "error",
    base,
    build: {
      emptyOutDir: true,
      outDir: `dist/${env}`,
    },
    // @ts-ignore - unable to import directory as a package in Node.js
    plugins: [plugin(pluginConfig)],
  });

  return await readFile(outFile, "utf8");
}

const env = typeof Bun !== "undefined" ? "bun" : "node";

const fixturePath = resolve(__dirname, "../test/fixtures");

const fixtures = await readdir(fixturePath);

for (const fixture of fixtures) {
  const path = resolve(__dirname, "../test/fixtures", fixture);

  console.log("Building", fixture);

  if (fixture === "base-path") {
    await buildVite(path, env, undefined, "base_path");
  } else if (fixture.match(/sha\d{3}/)) {
    await buildVite(path, env, { algorithm: fixture as HashAlgorithm });
  } else {
    await buildVite(path, env);
  }
}
