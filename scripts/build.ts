import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { $, type Target } from "bun";

for (const target of ["bun", "node"]) {
  const baseDir = resolve(__dirname, "..", "./packages", target);

  $.cwd(baseDir);

  console.log("=== Building", target, "===");

  console.info("🦺", "Typechecking files...");

  await $`bunx tsc --noEmit`;

  console.info("💣", "Cleaning...");

  await $`rm -rf dist`;

  console.info("🔧", "Building...");

  const packageJsonTxt = await readFile(resolve(baseDir, "package.json"), "utf8");
  const packageJson = JSON.parse(packageJsonTxt);
  const dependencies = packageJson?.dependencies ?? {};

  const external = Object.keys(dependencies).filter((d) => d !== "shared");

  const distDir = resolve(baseDir, "dist");

  await Bun.build({
    entrypoints: [resolve(baseDir, "./src/index.ts")],
    outdir: distDir,
    target: target as Target,
    external,
  });

  console.info("🎨", "Copying types...");

  await $`cp ../shared/types.d.ts ./dist`;

  console.info("✨", "Build complete.");
}
