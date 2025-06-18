import { test } from "@playwright/test";
import { verifyMark, verifyTitle } from "./base.spec";

test("External Style", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page });

  await verifyMark({ page });
});
