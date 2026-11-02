import { expect, test } from "@playwright/test";

import { verifyTitle } from "./base.spec";

// An inline style makes the plugin create a style-src, which must not block the local stylesheet.
test("Inline and Local Styles", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page, checkStyle: true });

  const color = await page.locator("p").evaluate((el) => window.getComputedStyle(el).color);

  expect(color).toBe("rgb(255, 0, 255)");
});
