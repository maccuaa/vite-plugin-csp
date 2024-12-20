import { test } from "@playwright/test";
import { verifyDate, verifyStyle, verifyTitle } from "./base.spec";

test("sha512", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page });
  await verifyDate({ page, checkStyle: true });
  await verifyStyle({ page });
});
