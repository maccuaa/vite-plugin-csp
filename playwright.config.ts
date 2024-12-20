import { defineConfig, devices } from "@playwright/test";
import { readdir } from "node:fs/promises";

let port = 3000;

const fixtures = await readdir("./test/fixtures");

const APPS = fixtures.map((fixture) => ({
  url: `http://localhost:${port}`,
  command: `bun server.ts test/fixtures/${fixture}/dist ${port++}`,
  testFile: `**/${fixture}.spec.ts`,
  name: fixture,
}));

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config = defineConfig({
  name: "E2E Tests",
  outputDir: "test-results",
  reporter: "html",
  testDir: "./test/e2e",

  /* Configure projects for major browsers */
  projects: APPS.map((app) => {
    return {
      name: app.name,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: app.url,
      },
      testMatch: app.testFile,
    };
  }),

  /* Run your local dev server before starting the tests */
  webServer: APPS.map((app) => {
    return {
      command: app.command,
      url: app.url,
      timeout: 60 * 1000, // 60 seconds
      reuseExistingServer: false,
    };
  }),
});

console.log(JSON.stringify(config, null, 2));

export default config;
