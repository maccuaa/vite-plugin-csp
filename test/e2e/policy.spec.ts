import { expect, test } from "@playwright/test";
import { verifyTitle } from "./base.spec";

test("Custom Policy", async ({ page }) => {
  const messages: string[] = [];

  page.on("console", (msg) => {
    messages.push(msg.text().trim());
  });

  await page.goto("/");

  await verifyTitle({ page });

  expect(messages).toEqual(
    expect.arrayContaining([
      expect.stringContaining("https://example.com/"),
      expect.stringContaining("frame-src 'none'"),
    ]),
  );
});
