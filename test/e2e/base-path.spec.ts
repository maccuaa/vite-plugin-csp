import { test } from "@playwright/test";
import { verifyTitle } from "./base.spec";

test("Base Path", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page, checkStyle: true });
});
