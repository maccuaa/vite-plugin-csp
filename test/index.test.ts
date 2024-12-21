import { describe, expect, it, test } from "bun:test";
import { generateCspPlugin } from "../src";
import type { Config, CspPluginConfiguration, CspPolicy, HashAlgorithm } from "../src/types";
import { build } from "vite";
import { resolve } from "node:path";
import { ScriptHandler } from "../src/ScriptHandler";
import { StyleHandler } from "../src/StyleHandler";
import { addToPolicy } from "../src/utils";

async function buildVite(entryPath: string, pluginConfig?: CspPluginConfiguration, base?: string) {
  const projectRoot = resolve(__dirname, entryPath);
  const outFile = resolve(projectRoot, "dist", "index.html");

  await build({
    root: projectRoot,
    logLevel: "error",
    base,
    plugins: [generateCspPlugin(pluginConfig)],
  });

  return await Bun.file(outFile).text();
}

describe("vite-plugin-bun-csp", () => {
  it("should add a default CSP tag to the html", async () => {
    const output = await buildVite("./fixtures/sanity");
    expect(output).toMatchSnapshot();
  });

  describe("scripts", () => {
    const cases = [
      ["inline", "./fixtures/script-inline"],
      ["local", "./fixtures/script-local"],
      ["external", "./fixtures/script-external"],
    ];

    test.each(cases)("it should handle %s scripts", async (_, path) => {
      const output = await buildVite(path);
      expect(output).toMatchSnapshot();
    });
  });

  describe("styles", () => {
    const cases = [
      ["inline", "./fixtures/style-inline"],
      ["local", "./fixtures/style-local"],
      ["external", "./fixtures/style-external"],
    ];

    test.each(cases)("it should handle %s styles", async (_, path) => {
      const output = await buildVite(path);
      expect(output).toMatchSnapshot();
    });

    it("should automatically handle Google Fonts", async () => {
      const output = await buildVite("./fixtures/google-fonts");
      expect(output).toMatchSnapshot();
    });
  });

  describe("edge-cases", () => {
    it("should skip elements that already have an integrity hash", () => {
      const config: Config = { root: "", base: "", outDir: "" };
      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler("sha256", config);
      const styleHandler = new StyleHandler("sha256", config);

      const html = `
        <html>
          <head>
            <script src="index.js" integrity="sha384-vTb4ka/HRdvMTCK99IHf4grsm4H7ngk8QotM6VmrozV6fFTs6kVHItFSLXWTgnAh"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reset-css@5.0.2/reset.min.css" integrity="sha384-keU0jZorLpCR/4h2i+vCgG3TUPKXXt1zOsXoIcwy0uRJKOBQ26zPqJpJj6hPdgpa" />
          </head>
          <body>
            <h1 id="app"></h1>
          </body>
        </html>
      `;

      const newHtml = rewriter.on("script", scriptHandler).on("link", styleHandler).transform(html);

      expect(newHtml).toMatchSnapshot();
      expect(scriptHandler.hashValues).toEqual(
        "'sha384-vTb4ka/HRdvMTCK99IHf4grsm4H7ngk8QotM6VmrozV6fFTs6kVHItFSLXWTgnAh'"
      );
      expect(styleHandler.hashValues).toEqual(
        "'sha384-keU0jZorLpCR/4h2i+vCgG3TUPKXXt1zOsXoIcwy0uRJKOBQ26zPqJpJj6hPdgpa'"
      );
    });

    it("should skip link elements that are missing attributes", () => {
      const config: Config = { root: "", base: "", outDir: "" };
      const rewriter = new HTMLRewriter();
      const styleHandler = new StyleHandler("sha256", config);

      const html = `
        <html>
          <head>
            <!-- rel is not "stylesheet" -->
            <link rel="icon" href="favicon.ico" />
            <!-- element has no rel attribute -->
            <link href="https://vite.dev" />
            <!-- element has no href -->
            <link rel="stylesheet" />
          </head>
          <body>
            <h1 id="app"></h1>
          </body>
        </html>
      `;

      const newHtml = rewriter.on("link", styleHandler).transform(html);

      expect(newHtml).toEqual(html);
    });

    it("should not duplicate hash or url values", () => {
      const config: Config = { root: "", base: "", outDir: "" };

      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler("sha384", config);
      const styleHandler = new StyleHandler("sha384", config);

      const html = `
        <html>
          <head>
            <script src="index.js" integrity="sha384-vTb4ka/HRdvMTCK99IHf4grsm4H7ngk8QotM6VmrozV6fFTs6kVHItFSLXWTgnAh"></script>
            <script src="index.js" integrity="sha384-vTb4ka/HRdvMTCK99IHf4grsm4H7ngk8QotM6VmrozV6fFTs6kVHItFSLXWTgnAh"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reset-css@5.0.2/reset.min.css" integrity="sha384-keU0jZorLpCR/4h2i+vCgG3TUPKXXt1zOsXoIcwy0uRJKOBQ26zPqJpJj6hPdgpa" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reset-css@5.0.2/reset.min.css" />
          </head>
          <body>
            <h1 id="app"></h1>
          </body>
        </html>
      `;

      const newHtml = rewriter.on("script", scriptHandler).on("link", styleHandler).transform(html);

      expect(newHtml).toMatchSnapshot();
      expect(scriptHandler.hashValues).toEqual(
        "'sha384-vTb4ka/HRdvMTCK99IHf4grsm4H7ngk8QotM6VmrozV6fFTs6kVHItFSLXWTgnAh'"
      );
      expect(styleHandler.hashValues).toEqual(
        "'sha384-keU0jZorLpCR/4h2i+vCgG3TUPKXXt1zOsXoIcwy0uRJKOBQ26zPqJpJj6hPdgpa'"
      );
      expect(styleHandler.urls).toEqual("https://cdn.jsdelivr.net");
    });

    it("should handle base path", async () => {
      const output = await buildVite("./fixtures/base-path", undefined, "base_path");
      expect(output).toMatchSnapshot();
    });
  });

  describe("algorithms", () => {
    const cases: HashAlgorithm[] = ["sha256", "sha384", "sha512"];

    test.each(cases)("should support the %s algorithm", async (algorithm) => {
      const output = await buildVite(`./fixtures/${algorithm}`, { algorithm });
      expect(output).toMatchSnapshot();
    });
  });

  describe("policy", () => {
    it("should add to existing policy", async () => {
      const output = await buildVite("./fixtures/policy", {
        policy: {
          "font-src": ["fonts.gstatic.com"],
          "style-src": ["fonts.googleapis.com"],
        },
      });
      expect(output).toMatchSnapshot();
    });

    it("should not add duplicate directive values", () => {
      const policy: CspPolicy = {};

      addToPolicy(policy, "script-src", "'self'");
      addToPolicy(policy, "script-src", "'self'");

      expect(policy["script-src"]).toEqual(["'self'"]);

      addToPolicy(policy, "script-src", "'self' sha256-123");

      expect(policy["script-src"]).toEqual(["'self'", "sha256-123"]);
    });
  });
});
