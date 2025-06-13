import { describe, expect, test } from "bun:test";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const basePath = resolve(__dirname, "./fixtures");

const fixtures = await readdir(basePath);

describe("vite-plugin-csp", () => {
  test.each(fixtures)("%s", async (fixture) => {
    const bunMap = await crawlDirectory(fixture, "bun");
    const nodeMap = await crawlDirectory(fixture, "node");
    const bunCliMap = await crawlDirectory(fixture, "cli-bun");

    expect(bunMap).toEqual(nodeMap);
    expect(bunMap).toEqual(bunCliMap);
  });
});

const crawlDirectory = async (path: string, env: "node" | "bun" | "cli-bun"): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  const distPath = resolve(basePath, path, "dist", env);

  const files = await readdir(distPath, { recursive: true });

  for (const file of files) {
    const filePath = resolve(distPath, file);

    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      continue;
    }

    const fileContents = await Bun.file(filePath).text();

    map.set(file, fileContents);
  }

  return map;
};
