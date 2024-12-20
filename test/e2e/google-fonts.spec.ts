import { test } from "@playwright/test";
import { verifyFont } from "./base.spec";

test("Google Fonts", async ({ page }) => {
  await page.goto("/");

  await verifyFont({ page });
});
