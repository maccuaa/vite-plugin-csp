import { expect, test } from "@playwright/test";

test("injects a working CSP into the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Home")).toBeVisible();

  const content = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(content).toBeTruthy();
  expect(content).toContain("script-src");
});

test("injects a working CSP into a nested page", async ({ page }) => {
  await page.goto("/about/index.html");
  await expect(page.getByText("About")).toBeVisible();

  const content = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(content).toBeTruthy();
  expect(content).toContain("script-src");
});
