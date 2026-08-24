import { describe, expect, test } from "bun:test";
import { BunFile } from "../packages/shared/BunFile";
import { BunHash } from "../packages/shared/BunHash";
import { StyleHandler } from "../packages/shared/StyleHandler";

const makeElement = (attrs: Record<string, string>) => ({
  getAttribute: (name: string) => attrs[name] ?? null,
  hasAttribute: (name: string) => name in attrs,
  setAttribute: (name: string, value: string) => {
    attrs[name] = value;
  },
});

describe("StyleHandler", () => {
  test("dedupes repeated stylesheet origins in the generated urls list", async () => {
    const config = { base: "", outDir: "", root: "." };
    const handler = new StyleHandler("sha256", config, BunHash, BunFile);

    await handler.element(
      // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
      makeElement({ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto" }) as any,
    );
    await handler.element(
      // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
      makeElement({ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato" }) as any,
    );

    expect(handler.urls).toBe("https://fonts.googleapis.com");
  });

  test("keeps distinct origins separate", async () => {
    const config = { base: "", outDir: "", root: "." };
    const handler = new StyleHandler("sha256", config, BunHash, BunFile);

    await handler.element(
      // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
      makeElement({ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto" }) as any,
    );
    await handler.element(
      // biome-ignore lint/suspicious/noExplicitAny: minimal mock of the HTMLRewriter Element interface for this test.
      makeElement({ rel: "stylesheet", href: "https://cdn.example.com/css2?family=OpenSans" }) as any,
    );

    expect(handler.urls).toBe("https://fonts.googleapis.com https://cdn.example.com");
  });
});
