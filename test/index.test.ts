import { $, file } from "bun";
import { beforeAll, expect, it } from "bun:test";

// build the sample app
beforeAll(async () => {
  $.cwd("./sample");

  console.info("Cleaning...");
  await $`rm -rf node_modules dist`;

  console.info("Installing dependencies...");
  await $`bun i`;

  console.info("Building sample app...");
  await $`bun run build`;
});

it("should inject the CSP into document", async () => {
  const html = await file("./sample/dist/index.html").text();

  // There should be no devDependencies
  expect(devDependencies).toBeUndefined();

  // package.json should only include modules actually used by the app
  expect(dependencies).toContainAllKeys(["react", "react-dom", "scheduler"]);
});
