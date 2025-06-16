import { resolve } from "node:path";
import { $ } from "bun";

const rootDir = resolve(__dirname, "..");

for (const target of ["vite-bun", "cli-bun"]) {
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

  const external = Object.keys(dependencies);

  const distDir = resolve(baseDir, "dist");

  await Bun.build({
    entrypoints: [resolve(baseDir, "./src/index.ts")],
    outdir: distDir,
    target: "bun",
    external,
  });

  // TODO: try generating types with `bunx tsc --emitDeclarationOnly`
  console.info("🎨", "Copying types...");

  await $`cp ../shared/types.d.ts ./dist`;

  console.info("📦", "Running publint...");

  await $`bunx publint`;

  console.info("🔍", "Running Are the Types Wrong...");

  await $`bunx attw --config-path ${rootDir}/.attw.json`;

  console.info("✨", "Build complete.");
}
