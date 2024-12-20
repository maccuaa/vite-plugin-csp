import { expect, type Page } from "@playwright/test";

export const verifyTitle = async ({ page }: { page: Page }) => {
  const element = page.getByText("Hello World");

  await expect(element).toBeVisible();
};

export const verifyDate = async ({ page, checkStyle = false }: { page: Page; checkStyle?: boolean }) => {
  const element = page.locator("#date");

  const date = new Date();
  const expected = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

  await expect(element).toContainText(expected);

  if (checkStyle) {
    const color = await element.evaluate((el) => window.getComputedStyle(el).color);

    expect(color).toBe("rgb(255, 0, 255)");
  }
};

export const verifyFont = async ({ page }: { page: Page }) => {
  const element = page.getByText("Hello World");

  await expect(element).toBeVisible();

  const fontFamily = await element.evaluate((el) => window.getComputedStyle(el).fontFamily);

  expect(fontFamily).toBe("Tomorrow");
};

export const verifyStyle = async ({ page }: { page: Page }) => {
  const element = page.getByText("Hello World");

  await expect(element).toBeVisible();

  const color = await element.evaluate((el) => window.getComputedStyle(el).color);

  expect(color).toBe("rgb(128, 0, 128)");
};
