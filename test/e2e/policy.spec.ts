import { expect, test } from "@playwright/test";
import { verifyTitle } from "./base.spec";

test("Custom Policy", async ({ page }) => {
  const messages: string[] = [];

  page.on("console", (msg) => {
    messages.push(msg.text().trim());
  });

  await page.goto("/");

  await verifyTitle({ page });

  expect(messages).toContain(
    `Refused to frame 'https://example.com/' because it violates the following Content Security Policy directive: "frame-src 'none'".`,
  );
});
