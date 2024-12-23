import { $ } from "bun";

console.info("💣", "Cleaning...");

await $`rm -rf dist`;

console.info("🔧", "Building...");

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
});

console.info("🎨", "Generating types...");

await $`bunx tsc --project tsconfig.build.json`;

console.info("✨", "Build complete.");
