import { HTMLRewriter } from "@miniflare/html-rewriter";
import { InlineScriptHandler } from "shared/InlineScriptHandler";
import { InlineStyleHandler } from "shared/InlineStyleHandler";
import { MetaHandler } from "shared/MetaHandler";
import { ScriptHandler } from "shared/ScriptHandler";
import { StyleHandler } from "shared/StyleHandler";
import type { Config } from "shared/internal";
import type { CspPluginConfiguration, CspPolicy, generateCspPlugin as GenerateCspPlugin } from "shared/types";
import { buildCsp, resolvePath } from "shared/utils";
import type { PluginOption } from "vite";
import { NodeFile } from "./NodeFile.js";
import { NodeHash } from "./NodeHash.js";

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
export const generateCspPlugin: typeof GenerateCspPlugin = (options: CspPluginConfiguration = {}): PluginOption => {
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

        const htmlFile = new NodeFile(htmlPath);

        const originalHtml = await htmlFile.read();

        const scriptHandler = new ScriptHandler(algorithm, config, NodeHash, NodeFile);
        const inlineScriptHandler = new InlineScriptHandler(algorithm, config, NodeHash, NodeFile);
        const styleHandler = new StyleHandler(algorithm, config, NodeHash, NodeFile);
        const inlineStyleHandler = new InlineStyleHandler(algorithm, config, NodeHash, NodeFile);

        const newHtml = await new HTMLRewriter()
          .on("script", scriptHandler)
          .on("script", inlineScriptHandler)
          .on("link", styleHandler)
          .on("style", inlineStyleHandler)
          .transform(new Response(originalHtml))
          .text();

        const csp = buildCsp(policy, {
          scriptHandler,
          inlineScriptHandler,
          styleHandler,
          inlineStyleHandler,
        });

        const metaHandler = new MetaHandler(csp);

        const finalHtml = await new HTMLRewriter().on("meta", metaHandler).transform(new Response(newHtml)).text();

        await htmlFile.write(finalHtml);
      },
    },
  };
};
