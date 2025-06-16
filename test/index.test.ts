import { describe, expect, test } from "bun:test";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { Target } from "../scripts/fixtures";

const basePath = resolve(__dirname, "./fixtures");

const fixtures = await readdir(basePath);

describe("vite-plugin-csp", () => {
  test.each(fixtures)("%s", async (fixture) => {
    const vite = await readHtml(fixture, "bun-vite");
    const cli = await readHtml(fixture, "bun-cli");

    expect(vite).toEqual(cli);
  });
});

const readHtml = async (path: string, target: Target): Promise<string> => {
  const htmlPath = resolve(basePath, path, "dist", target, "index.html");

  return await Bun.file(htmlPath).text();
};
