import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { $ } from "bun";

const cliPath = join(import.meta.dir, "../packages/cli-bun/src/index.ts");

/** Minimal HTML page with an empty CSP meta tag and an inline script, so processing is easy to detect. */
const pageHtml = `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="" />
  </head>
  <body>
    <script>console.log("hi");</script>
  </body>
</html>
`;

const writePage = async (path: string) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, pageHtml);
};

describe("csp-bun-cli --pattern", () => {
  test("only processes files matching the custom pattern", async () => {
    const workDir = await mkdtemp(join(tmpdir(), "csp-pattern-"));

    try {
      const rootPath = join(workDir, "index.html");
      const nestedPath = join(workDir, "about/index.html");

      await writePage(rootPath);
      await writePage(nestedPath);

      // "*.html" (no `**/`) only matches top-level files, not the nested "about/index.html".
      await $`bun run ${cliPath} --dir ${workDir} --pattern "*.html"`.quiet();

      const rootContent = await Bun.file(rootPath).text();
      const nestedContent = await Bun.file(nestedPath).text();

      expect(rootContent).not.toContain('content=""');
      expect(nestedContent).toContain('content=""');
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });

  test("defaults to recursively matching **/*.html when --pattern is omitted", async () => {
    const workDir = await mkdtemp(join(tmpdir(), "csp-pattern-default-"));

    try {
      const rootPath = join(workDir, "index.html");
      const nestedPath = join(workDir, "about/index.html");

      await writePage(rootPath);
      await writePage(nestedPath);

      await $`bun run ${cliPath} --dir ${workDir}`.quiet();

      const rootContent = await Bun.file(rootPath).text();
      const nestedContent = await Bun.file(nestedPath).text();

      expect(rootContent).not.toContain('content=""');
      expect(nestedContent).not.toContain('content=""');
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });

  test("fatal error message includes the active pattern when nothing matches", async () => {
    const workDir = await mkdtemp(join(tmpdir(), "csp-pattern-empty-"));

    try {
      const result = await $`bun run ${cliPath} --dir ${workDir} --pattern "*.nomatch"`.quiet().nothrow();

      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("*.nomatch");
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });
});
