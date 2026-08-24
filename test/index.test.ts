import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Glob } from "bun";
import type { Target } from "../scripts/fixtures";

const basePath = resolve(__dirname, "./fixtures");

const fixtures = await readdir(basePath);

describe("vite-plugin-csp", () => {
  test.each(fixtures)("%s", async (fixture) => {
    const vitePages = await findHtmlPages(fixture, "bun-vite");
    const cliPages = await findHtmlPages(fixture, "bun-cli");

    expect(cliPages.map((p) => p.relativePath).sort()).toEqual(vitePages.map((p) => p.relativePath).sort());

    for (const page of vitePages) {
      const match = cliPages.find((p) => p.relativePath === page.relativePath);
      expect(match?.contents).toEqual(page.contents);
    }
  });
});

const findHtmlPages = async (fixture: string, target: Target) => {
  const distDir = resolve(basePath, fixture, "dist", target);
  const glob = new Glob("**/*.html");
  const pages: { relativePath: string; contents: string }[] = [];

  for await (const file of glob.scan({ cwd: distDir })) {
    pages.push({ relativePath: file, contents: await Bun.file(resolve(distDir, file)).text() });
  }

  return pages;
};
