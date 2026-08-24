import { afterEach, describe, expect, mock, test } from "bun:test";
import { BunFile } from "../packages/shared/BunFile";
import { BunHash } from "../packages/shared/BunHash";
import { ScriptHandler } from "../packages/shared/ScriptHandler";

const makeElement = (attrs: Record<string, string>) => ({
  getAttribute: (name: string) => attrs[name] ?? null,
  hasAttribute: (name: string) => name in attrs,
  setAttribute: (name: string, value: string) => {
    attrs[name] = value;
  },
});

describe("getFileContents (via ScriptHandler)", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("does not set an integrity attribute when the remote fetch returns a non-ok status", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: minimal fetch mock for this test.
    globalThis.fetch = mock(async () => new Response("Not Found", { status: 404 })) as any;

    const config = { base: "", outDir: "", root: "." };
    const handler = new ScriptHandler("sha256", config, BunHash, BunFile);

    const element = makeElement({ src: "https://example.com/missing.js" });

    // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
    await handler.element(element as any);

    expect(element.getAttribute("integrity")).toBeNull();
  });

  test("still sets an integrity attribute when the remote fetch succeeds", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: minimal fetch mock for this test.
    globalThis.fetch = mock(async () => new Response("console.log('ok')", { status: 200 })) as any;

    const config = { base: "", outDir: "", root: "." };
    const handler = new ScriptHandler("sha256", config, BunHash, BunFile);

    const element = makeElement({ src: "https://example.com/present.js" });

    // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
    await handler.element(element as any);

    expect(element.getAttribute("integrity")).toStartWith("sha256-");
  });
});
