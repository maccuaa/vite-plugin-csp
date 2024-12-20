import { test } from "@playwright/test";
import { verifyDate } from "./base.spec";

test("External Script", async ({ page }) => {
  await page.goto("/");

  await verifyDate({ page });
});
