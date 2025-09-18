import { test } from "@playwright/test";
import { verifyFont, verifyTitle } from "./base.spec";

// Test fixture for proper handling of unsafe-styles - https://github.com/maccuaa/vite-plugin-csp/issues/119
test("Unsafe Styles", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page, checkStyle: true });
  await verifyFont({ page });
});
