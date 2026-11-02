import { describe, expect, test } from "bun:test";

import type { Handlers } from "../packages/shared/internal";
import type { CspPolicy } from "../packages/shared/types";
import { buildCsp } from "../packages/shared/utils";

const GOOGLE_FONTS = "https://fonts.googleapis.com";

const handlersWith = ({ inlineStyleHashes = "", styleUrls = "" } = {}) =>
  ({
    scriptHandler: { hashValues: "" },
    inlineScriptHandler: { hashValues: "" },
    styleHandler: { urls: styleUrls },
    inlineStyleHandler: { hashValues: inlineStyleHashes },
  }) as unknown as Handlers;

describe("buildCsp", () => {
  describe("a style-src or font-src that the plugin creates", () => {
    test("keeps 'self' in the style-src created for inline styles", () => {
      const policy: CspPolicy = { "default-src": ["'self'"] };

      const csp = buildCsp(policy, handlersWith({ inlineStyleHashes: "'sha256-abc'" }));

      expect(policy["style-src"]).toEqual(["'sha256-abc'", "'self'"]);
      expect(csp).toBe("default-src 'self'; style-src 'sha256-abc' 'self'");
    });

    test("keeps 'self' in the style-src and font-src created for Google Fonts", () => {
      const policy: CspPolicy = { "default-src": ["'self'"] };

      buildCsp(policy, handlersWith({ styleUrls: GOOGLE_FONTS }));

      expect(policy["style-src"]).toEqual([GOOGLE_FONTS, "'self'"]);
      expect(policy["font-src"]).toEqual(["fonts.gstatic.com", "'self'"]);
    });

    test("keeps 'self' when the policy has no default-src", () => {
      const policy: CspPolicy = { "script-src": ["'self'"] };

      buildCsp(policy, handlersWith({ inlineStyleHashes: "'sha256-abc'" }));

      expect(policy["style-src"]).toEqual(["'sha256-abc'", "'self'"]);
    });

    test("does not add 'self' when default-src denies same-origin resources", () => {
      const policy: CspPolicy = { "default-src": ["'none'"] };

      buildCsp(policy, handlersWith({ inlineStyleHashes: "'sha256-abc'", styleUrls: GOOGLE_FONTS }));

      expect(policy["style-src"]).toEqual(["'sha256-abc'", GOOGLE_FONTS]);
      expect(policy["font-src"]).toEqual(["fonts.gstatic.com"]);
    });

    test("creates neither directive when the page has no styles or fonts to add", () => {
      const policy: CspPolicy = { "default-src": ["'self'"] };

      buildCsp(policy, handlersWith());

      expect(policy["style-src"]).toBeUndefined();
      expect(policy["font-src"]).toBeUndefined();
    });
  });

  describe("a style-src or font-src that the policy already defines", () => {
    test("is only appended to, without adding 'self'", () => {
      const policy: CspPolicy = {
        "default-src": ["'self'"],
        "style-src": ["https://cdn.example.com"],
        "font-src": ["https://cdn.example.com"],
      };

      buildCsp(policy, handlersWith({ inlineStyleHashes: "'sha256-abc'", styleUrls: GOOGLE_FONTS }));

      expect(policy["style-src"]).toEqual(["https://cdn.example.com", "'sha256-abc'", GOOGLE_FONTS]);
      expect(policy["font-src"]).toEqual(["https://cdn.example.com", "fonts.gstatic.com"]);
    });
  });
});
