import { readdir } from "node:fs/promises";
import { defineConfig, devices } from "@playwright/test";

let port = 3000;

const fixtures = await readdir("./test/fixtures");

const envs = ["bun", "node"];

interface App {
  url: string;
  command: string;
  testFile: string;
  name: string;
}

const APPS = envs.reduce((apps, env) => {
  return apps.concat(
    ...fixtures.map((fixture) => ({
      url: `http://localhost:${port}`,
      command: `bun ./scripts/server.ts test/fixtures/${fixture}/dist/${env} ${port++}`,
      testFile: `**/${fixture}.spec.ts`,
      name: env,
    })),
  );
}, [] as App[]);

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

  /* Run local dev server before starting the tests */
  webServer: APPS.map((app) => {
    return {
      command: app.command,
      url: app.url,
      timeout: 60 * 1000, // 60 seconds
      reuseExistingServer: false,
    };
  }),
});

export default config;
