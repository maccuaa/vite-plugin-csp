import { expect, type Page } from "@playwright/test";

interface Props {
  page: Page;
}

interface TitleProps {
  page: Page;
  title?: string;
  checkStyle?: boolean;
}

export const verifyTitle = async ({ page, title = "Hello World", checkStyle = false }: TitleProps) => {
  const element = page.getByText(title);

  await expect(element).toBeVisible();

  if (checkStyle) {
    const color = await element.evaluate((el) => window.getComputedStyle(el).color);

    expect(color).toBe("rgb(128, 0, 128)");
  }
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

export const verifyFont = async ({ page }: Props) => {
  const element = page.getByText("Hello World");

  await expect(element).toBeVisible();

  const fontFamily = await element.evaluate((el) => window.getComputedStyle(el).fontFamily);

  expect(fontFamily).toBe("Tomorrow");
};

export const verifyMark = async ({ page }: Props) => {
  const element = page.locator("mark");

  const color = await element.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  expect(color).toBe("rgb(253, 231, 192)");
};
