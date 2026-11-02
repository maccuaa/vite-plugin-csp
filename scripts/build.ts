import { resolve } from "node:path";
import { $, Glob } from "bun";
import { dts } from "bun-dts";

const rootDir = resolve(__dirname, "..");

for (const target of ["vite-bun", "cli-bun"]) {
  const baseDir = resolve(__dirname, "..", "./packages", target);

  $.cwd(baseDir);

  console.log("=== Building", target, "===");

  console.info("💣", "Cleaning...");

  await $`rm -rf dist`;

  console.info("🔧", "Type checking and building...");

  const packageJson = await Bun.file(resolve(baseDir, "package.json")).json();
  const dependencies = packageJson?.dependencies ?? {};

  const external = Object.keys(dependencies);

  const distDir = resolve(baseDir, "dist");

  await Bun.build({
    entrypoints: [resolve(baseDir, "./src/index.ts")],
    outdir: distDir,
    target: "bun",
    external,
    check: true,
    plugins: [dts({ cwd: baseDir, resolve: ["shared/types"] })],
  });

  console.info("🧾", "Checking type declarations are self-contained...");

  // `shared` is a private workspace package, so consumers can't resolve it. publint and attw don't catch this.
  for await (const file of new Glob("**/*.d.ts").scan({ cwd: distDir, absolute: true })) {
    if (/(?:from|import\()\s*["']shared\//.test(await Bun.file(file).text())) {
      throw new Error(`${file} references the private "shared" workspace package.`);
    }
  }

  console.info("📦", "Running publint...");

  await $`bunx publint`;

  console.info("🔍", "Running Are the Types Wrong...");

  await $`bunx attw --config-path ${rootDir}/.attw.json`;

  console.info("✨", "Build complete.");
}
