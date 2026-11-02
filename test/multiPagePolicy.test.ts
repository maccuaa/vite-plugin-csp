import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BunFile } from "../packages/shared/BunFile";
import { handler } from "../packages/shared/BunHandler";
import { BunHash } from "../packages/shared/BunHash";
import type { CspPolicy } from "../packages/shared/types";

const page = (script: string) =>
  `<html><head><meta http-equiv="Content-Security-Policy" content="" /></head><body><script>${script}</script></body></html>`;

const hashesIn = async (path: string) => {
  const html = await Bun.file(path).text();
  const csp = html.match(/content="([^"]*)"/)?.[1] ?? "";

  return csp.match(/'sha256-[^']+'/g) ?? [];
};

describe("handler with several pages", () => {
  let dir = "";
  let pageA = "";
  let pageB = "";

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "csp-pages-"));
    pageA = join(dir, "a.html");
    pageB = join(dir, "b.html");

    await Bun.write(pageA, page("console.log('page A')"));
    await Bun.write(pageB, page("console.log('page B')"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const run = (policy: CspPolicy) =>
    handler({
      algorithm: "sha256",
      config: { base: "", outDir: "", root: dir },
      policy,
      BunHash,
      BunFile,
      htmlPaths: [pageA, pageB],
    });

  test("gives every page only its own hashes, even if the policy already has a script-src", async () => {
    await run({ "script-src": ["'self'"] });

    const hashesA = await hashesIn(pageA);
    const hashesB = await hashesIn(pageB);

    expect(hashesA).toHaveLength(1);
    expect(hashesB).toHaveLength(1);
    expect(hashesB).not.toContain(hashesA[0]);
  });

  test("does not modify the policy it is given", async () => {
    const policy: CspPolicy = { "default-src": ["'self'"], "script-src": ["'self'"] };

    await run(policy);

    expect(policy).toEqual({ "default-src": ["'self'"], "script-src": ["'self'"] });
  });
});
