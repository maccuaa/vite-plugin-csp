import type { Config, CspPolicy, Handlers } from "./types";
import { join } from "node:path";

const GOOGLE_FONTS_URL = "fonts.gstatic.com";

export const buildCsp = (policy: CspPolicy, handlers: Handlers): string => {
  const { inlineScriptHandler, inlineStyleHandler, scriptHandler, styleHandler } = handlers;

  // Add SRI hashes to the CSP
  addToPolicy(policy, "script-src", scriptHandler.hashValues);
  addToPolicy(policy, "script-src", inlineScriptHandler.hashValues);
  addToPolicy(policy, "style-src", inlineStyleHandler.hashValues);

  if (scriptHandler.hashValues || inlineScriptHandler.hashValues) {
    addToPolicy(policy, "script-src", "'strict-dynamic'");
  }

  // Styles are handled differently than scripts. Unlike scripts, the URLs need to be explicitly allow-listed even if the SRI is in the CSP
  addToPolicy(policy, "style-src", styleHandler.urls);
  if (inlineScriptHandler.hashValues.length) {
    addToPolicy(policy, "style-src", "'self'");
  }

  // Be nice and automatically add Google Fonts to the CSP
  if (styleHandler.urls.includes("fonts.googleapis.com")) {
    addToPolicy(policy, "font-src", GOOGLE_FONTS_URL);
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
