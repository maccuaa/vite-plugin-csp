import { test } from "@playwright/test";
import { verifyTitle } from "./base.spec";

test("Sanity", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page });
});
