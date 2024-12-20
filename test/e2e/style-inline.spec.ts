import { test } from "@playwright/test";
import { verifyStyle, verifyTitle } from "./base.spec";

test("Inline Styles", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page });
  await verifyStyle({ page });
});
