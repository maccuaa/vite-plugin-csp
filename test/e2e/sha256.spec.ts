import { test } from "@playwright/test";
import { verifyDate, verifyMark, verifyTitle } from "./base.spec";

test("sha256", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page, checkStyle: true });
  await verifyDate({ page, checkStyle: true });
  await verifyMark({ page });
});
