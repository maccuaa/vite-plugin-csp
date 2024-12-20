import { test } from "@playwright/test";
import { verifyFont } from "./base.spec";

test("Custom Policy", async ({ page }) => {
  await page.goto("/");

  await verifyFont({ page });
});
