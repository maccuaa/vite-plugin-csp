import type { Plugin } from "vite";
import type { CspPolicy, CspPluginConfiguration } from "./types";
import { ScriptHandler } from "./ScriptHandler";
import { StyleHandler } from "./StyleHandler";
import { InlineStyleHandler } from "./InlineStyleHandler";
import { InlineScriptHandler } from "./InlineScriptHandler";
import { buildCsp } from "./utils";
import { join, resolve } from "node:path";

/**
 * Default CSP policy.
 * @link https://web.dev/articles/strict-csp
 */
export const DEFAULT_CSP_POLICY: CspPolicy = {
  "base-uri": ["'none'"],
  "default-src": ["'self'"],
  "object-src": ["'none'"],
};

/**
 *
 * @param options
 * @returns
 */
export const generateCspPlugin = (options: CspPluginConfiguration = {}): Plugin => {
  const { algorithm = "sha384" } = options;

  const startingPolicy = options.policy ?? { ...DEFAULT_CSP_POLICY };

  let outDir = "";

  return {
    name: "generate-csp",
    enforce: "post",
    apply: "build",
    configResolved: (config) => {
      outDir = join(config.root, config.build.outDir);
    },
    closeBundle: {
      order: "post",
      handler: async () => {
        const policy = { ...startingPolicy };

        const htmlPath = resolve(outDir, "index.html");

        const htmlFile = Bun.file(htmlPath);

        if (!(await htmlFile.exists())) {
          console.error("unable to resolve index.html:", htmlFile);
          process.exit(1);
        }

        const html = await htmlFile.text();

        const rewriter = new HTMLRewriter();
        const scriptHandler = new ScriptHandler(algorithm, outDir);
        const inlineScriptHandler = new InlineScriptHandler(algorithm, outDir);
        const styleHandler = new StyleHandler(algorithm, outDir);
        const inlineStyleHandler = new InlineStyleHandler(algorithm, outDir);

        const newHtml = rewriter
          .on("script", scriptHandler)
          .on("script", inlineScriptHandler)
          .on("link", styleHandler)
          .on("style", inlineStyleHandler)
          .transform(html);

        const csp = buildCsp(policy, { scriptHandler, inlineScriptHandler, styleHandler, inlineStyleHandler });

        const tag = `<meta http-equiv="Content-Security-Policy" content="${csp}" />`;

        let newHead: string;

        if (newHtml.includes("<head>")) {
          newHead = newHtml.replace(/<head>/, `<head>${tag}`);
        } else {
          newHead = newHtml.replace(/(<html.*>)/, `$1<head>${tag}`);
        }

        await Bun.write(htmlFile, newHead);
      },
    },
  };
};
