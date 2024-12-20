import type { IndexHtmlTransformContext, Plugin } from "vite";
import type { CspPolicy, CspPluginConfiguration } from "./types";
import { ScriptHandler } from "./ScriptHandler";
import { StyleHandler } from "./StyleHandler";
import { InlineStyleHandler } from "./InlineStyleHandler";
import { InlineScriptHandler } from "./InlineScriptHandler";
import { buildCsp, createAssetCache } from "./utils";

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

  const policy = options.policy ?? { ...DEFAULT_CSP_POLICY };

  return {
    name: "generate-csp",
    enforce: "post",
    apply: "build",

    transformIndexHtml: (html: string, { bundle }: IndexHtmlTransformContext) => {
      const assetCache = createAssetCache(bundle);

      const rewriter = new HTMLRewriter();
      const scriptHandler = new ScriptHandler(algorithm, assetCache);
      const inlineScriptHandler = new InlineScriptHandler(algorithm, assetCache);
      const styleHandler = new StyleHandler(algorithm, assetCache);
      const inlineStyleHandler = new InlineStyleHandler(algorithm, assetCache);

      const newHtml = rewriter
        .on("script", scriptHandler)
        .on("script", inlineScriptHandler)
        .on("link", styleHandler)
        .on("style", inlineStyleHandler)
        .transform(html);

      const csp = buildCsp(policy, { scriptHandler, inlineScriptHandler, styleHandler, inlineStyleHandler });

      const tag = `<meta http-equiv="Content-Security-Policy" content="${csp}" />`;

      if (newHtml.includes("<head>")) {
        return newHtml.replace(/<head>/, `<head>${tag}`);
      } else {
        return newHtml.replace(/(<html.*>)/, `$1<head>${tag}`);
      }
    },
  };
};
