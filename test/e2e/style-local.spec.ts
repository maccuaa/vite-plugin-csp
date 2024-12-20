import { test } from "@playwright/test";
import { verifyStyle } from "./base.spec";

test("Inline Styles", async ({ page }) => {
  await page.goto("/");

  await verifyStyle({ page });
});
