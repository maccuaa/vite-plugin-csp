import type { Plugin } from "vite";
import { InlineScriptHandler } from "./InlineScriptHandler";
import { InlineStyleHandler } from "./InlineStyleHandler";
import { ScriptHandler } from "./ScriptHandler";
import { StyleHandler } from "./StyleHandler";
import type { Config, CspPluginConfiguration, CspPolicy } from "./types";
import { buildCsp, resolvePath } from "./utils";

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
  let config: Config;

  return {
    name: "generate-csp",
    enforce: "post",
    apply: "build",
    configResolved: ({ root, base, build: { outDir } }) => {
      config = {
        base,
        outDir,
        root,
      };
    },
    closeBundle: {
      order: "post",
      handler: async () => {
        const policy = { ...startingPolicy };

        const htmlPath = resolvePath("index.html", config);

        const htmlFile = Bun.file(htmlPath);

        if (!(await htmlFile.exists())) {
          console.error("unable to resolve index.html:", htmlFile);
          process.exit(1);
        }

        const html = await htmlFile.text();

        const rewriter = new HTMLRewriter();
        const scriptHandler = new ScriptHandler(algorithm, config);
        const inlineScriptHandler = new InlineScriptHandler(algorithm, config);
        const styleHandler = new StyleHandler(algorithm, config);
        const inlineStyleHandler = new InlineStyleHandler(algorithm, config);

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
