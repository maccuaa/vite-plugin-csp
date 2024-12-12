import { type IndexHtmlTransformContext, type Plugin } from "vite";
import type { CSPPolicy, PluginConfiguration } from "./types";
import { ScriptHandler } from "./ScriptHandler";
import { MetaHandler } from "./MetaHandler";

export const DEFAULT_CSP_POLICY: CSPPolicy = {
  "default-src": ["'self'"],
  "img-src": ["'self'", "data:"],
  "script-src-elem": ["'self'"],
  "style-src-elem": ["'self'"],
  "object-src": ["'none'"],
};

export const generateCsp = (options: PluginConfiguration = {}): Plugin => {
  const { algorithm = "sha256", policy = DEFAULT_CSP_POLICY } = options;

  return {
    name: "generate-csp",
    enforce: "post",
    apply: "build",

    transformIndexHtml: (html: string, { bundle }: IndexHtmlTransformContext) => {
      // 1. Interate through all files in the context bundle. Put all JS chunks in a cache
      // 2. Parse the HTML. Get each script source from the cache and caclulate the hash
      // 3. Add the hash to the script src
      // 2. Add the CSP to the HTML

      if (!policy) {
        console.warn("No CSP policy defined. CSP Transformation not performed");
        return html;
      }

      if (!bundle) {
        console.warn("No bundle found. CSP Transformation not performed");
        return html;
      }

      // map of asset name to asset code
      const cache = new Map<string, string>();

      const bundles = Object.entries(bundle);
      for (const [name, bundle] of bundles) {
        if (bundle.type === "chunk") {
          // add a leading slash to the asset name
          cache.set(`/${name}`, bundle.code);
        }
      }

      const scriptHandler = new ScriptHandler(algorithm, cache);
      const cspHandler = new MetaHandler(scriptHandler, policy);
      const rewriter = new HTMLRewriter();

      // Transform the HTML
      const newScriptHtml = rewriter.on("script", scriptHandler).transform(html);
      const newHtml = rewriter.on("meta", cspHandler).transform(newScriptHtml);

      return newHtml;
    },
  };
};
