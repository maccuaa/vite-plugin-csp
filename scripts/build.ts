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

  const packageJson = await Bun.file(resolve(baseDir, "package.json")).json();
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
