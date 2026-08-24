import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

describe("csp-bun-cli error handling", () => {
  test("exits with a friendly error when the config file has no default export", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vite-plugin-csp-cli-"));

    try {
      await writeFile(join(dir, "index.html"), "<html><head></head><body></body></html>");
      const configPath = join(dir, "csp.config.ts");
      await writeFile(configPath, "export const notDefault = {};");

      const result = await $`bun run ./packages/cli-bun/src/index.ts --dir ${dir} --config ${configPath}`
        .nothrow()
        .quiet();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("Error:");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
