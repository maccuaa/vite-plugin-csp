import { describe, expect, it, test } from "bun:test";
import { generateCspPlugin } from "../src";
import type { CspPluginConfiguration, HashAlgorithm } from "../src/types";
import { build } from "vite";
import type { RollupOutput } from "rollup";
import { resolve } from "node:path";
import { ScriptHandler } from "../src/ScriptHandler";
import { StyleHandler } from "../src/StyleHandler";

async function buildVite(entryPath: string, pluginConfig?: CspPluginConfiguration) {
  const projectRoot = resolve(__dirname, entryPath);
  const entryFilename = "index.html";

  const outputs = (await build({
    root: projectRoot,
    logLevel: "error",
    plugins: [generateCspPlugin(pluginConfig)],
  })) as RollupOutput | RollupOutput[];
  const output = Array.isArray(outputs) ? outputs[0].output : outputs.output;

  const file = output.find((item) => item.fileName === entryFilename);

  if (!file) {
    throw new Error(`File with name ${entryFilename} not found in output.`);
  }

  let codeStr = "";
  if ("source" in file) {
    codeStr = file.source.toString();
  } else if ("code" in file) {
    codeStr = file.code;
  } else {
    throw new Error("The file object lacks both `source` and `code` properties.");
  }
  return codeStr;
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
      const cache = new Map<string, string>();

      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler("sha256", cache);
      const styleHandler = new StyleHandler("sha256", cache);

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
      const cache = new Map<string, string>();

      const rewriter = new HTMLRewriter();
      const styleHandler = new StyleHandler("sha256", cache);

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
      const cache = new Map<string, string>();

      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler("sha384", cache);
      const styleHandler = new StyleHandler("sha384", cache);

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

    it("should throw if the file contents are not found in the cache", () => {
      const cache = new Map<string, string>();

      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler("sha256", cache);
      const styleHandler = new StyleHandler("sha256", cache);

      const html = `
        <html>
          <head>
            <link href="style.css" rel="stylesheet" />
            <script src="index.js></script>
          </head>
          <body>
            <h1 id="app"></h1>
          </body>
        </html>
      `;

      const newHtml = rewriter.on("script", scriptHandler).on("link", styleHandler).transform(html);

      expect(newHtml).toEqual(html);
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
  });
});
