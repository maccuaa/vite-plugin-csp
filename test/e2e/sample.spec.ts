import { test } from "@playwright/test";
import { verifyDate, verifyTitle } from "./base.spec";

test("Sample", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page, title: "Hello Vite!", checkStyle: true });
  await verifyDate({ page });
});
