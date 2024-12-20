import { test } from "@playwright/test";
import { verifyTitle } from "./base.spec";

test("External Style", async ({ page }) => {
  await page.goto("/");

  await verifyTitle({ page });

  // TODO: assert that the external style was loaded!
});
