import { join } from "node:path";

import type { Config, Handlers } from "./internal";
import type { CspPolicy } from "./types";

const GOOGLE_FONTS_URL = "fonts.gstatic.com";

export const buildCsp = (policy: CspPolicy, handlers: Handlers): string => {
  const { inlineScriptHandler, inlineStyleHandler, scriptHandler, styleHandler } = handlers;

  // A style-src or font-src created below stops falling back to default-src, so it needs 'self' to keep loading
  // same-origin stylesheets and fonts, unless the policy denies same-origin resources by default.
  const defaultAllowsSelf = !policy["default-src"] || policy["default-src"].includes("'self'");
  const hadStyleSrc = !!policy["style-src"];
  const hadFontSrc = !!policy["font-src"];

  // Add SRI hashes to the CSP
  addToPolicy(policy, "script-src", scriptHandler.hashValues);
  addToPolicy(policy, "script-src", inlineScriptHandler.hashValues);

  // If 'unsafe-inline' is already present, don't add any hashes - https://github.com/maccuaa/vite-plugin-csp/issues/119
  if (!policy["style-src"]?.includes("'unsafe-inline'")) {
    addToPolicy(policy, "style-src", inlineStyleHandler.hashValues);
  }

  if (scriptHandler.hashValues || inlineScriptHandler.hashValues) {
    addToPolicy(policy, "script-src", "'strict-dynamic'");
  }

  // Styles are handled differently than scripts. Unlike scripts, the URLs need to be explicitly allow-listed even if the SRI is in the CSP
  addToPolicy(policy, "style-src", styleHandler.urls);
  if (inlineScriptHandler.hashValues.length || (defaultAllowsSelf && !hadStyleSrc && policy["style-src"])) {
    addToPolicy(policy, "style-src", "'self'");
  }

  // Be nice and automatically add Google Fonts to the CSP
  if (styleHandler.urls.includes("fonts.googleapis.com")) {
    addToPolicy(policy, "font-src", GOOGLE_FONTS_URL);
    if (defaultAllowsSelf && !hadFontSrc) {
      addToPolicy(policy, "font-src", "'self'");
    }
  }

  return Object.entries(policy)
    .map(([name, value]) => `${name} ${value.join(" ")}`)
    .join("; ");
};

export const addToPolicy = (policy: CspPolicy, directive: keyof CspPolicy, hashValues: string) => {
  const hashParts = hashValues
    .trim()
    .split(/\s+/)
    .filter((s) => s.length);

  if (hashParts.length) {
    if (!policy[directive]) {
      policy[directive] = [];
    }

    for (const hashPart of hashParts) {
      if (!policy[directive].includes(hashPart)) {
        policy[directive].push(hashPart);
      }
    }
  }
};

export const resolvePath = (filepath: string, { base, outDir, root }: Config) => {
  return join(root, outDir, filepath.replace(base, ""));
};

/**
 * Default CSP policy.
 * @link https://web.dev/articles/strict-csp
 */
export const DEFAULT_CSP_POLICY: CspPolicy = {
  "base-uri": ["'none'"],
  "default-src": ["'self'"],
  "object-src": ["'none'"],
};
