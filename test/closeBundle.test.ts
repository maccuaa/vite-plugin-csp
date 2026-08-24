import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateCspPlugin } from "../packages/vite-bun/src";

describe("generateCspPlugin closeBundle", () => {
  test("closeBundle.handler returns a Promise, and the CSP is written by the time it resolves", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vite-plugin-csp-"));

    try {
      await Bun.write(
        join(dir, "index.html"),
        '<html><head><meta http-equiv="Content-Security-Policy" content="" /></head><body></body></html>',
      );

      // biome-ignore lint/suspicious/noExplicitAny: PluginOption is a broad union; narrow it for direct hook access in this test.
      const plugin = generateCspPlugin() as any;

      // Mimic what Vite does before closeBundle: call configResolved once.
      plugin.configResolved({ root: dir, base: "/", build: { outDir: "." } });

      const result = plugin.closeBundle.handler();

      expect(result).toBeInstanceOf(Promise);

      await result;

      const html = await Bun.file(join(dir, "index.html")).text();

      expect(html).not.toContain('content=""');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
