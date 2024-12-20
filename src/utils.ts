import type { AssetCache, CspPolicy, Handlers, OutputBundle } from "./types";

const GOOGLE_FONTS_URL = "fonts.gstatic.com";

export const createAssetCache = (bundle: OutputBundle): AssetCache => {
  const assetCache: AssetCache = new Map<string, string>();

  if (bundle) {
    const bundles = Object.entries(bundle);
    for (const [name, bundle] of bundles) {
      if (bundle.type === "chunk") {
        // add a leading slash to the asset name
        assetCache.set(`/${name}`, bundle.code);
      } else if (name.endsWith(".css") && typeof bundle.source === "string") {
        assetCache.set(`/${name}`, bundle.source);
      }
    }
  }

  return assetCache;
};

export const buildCsp = (policy: CspPolicy, handlers: Handlers): string => {
  const { inlineScriptHandler, inlineStyleHandler, scriptHandler, styleHandler } = handlers;

  // Add SRI hashes to the CSP
  addToPolicy(policy, "script-src-elem", scriptHandler.hashValues);
  addToPolicy(policy, "script-src-elem", inlineScriptHandler.hashValues);
  addToPolicy(policy, "style-src", inlineStyleHandler.hashValues);

  if (scriptHandler.hashValues || inlineScriptHandler.hashValues) {
    addToPolicy(policy, "script-src", "'strict-dynamic'");
  }

  // Styles are handled differently than scripts. Unlike scripts, the URLs need to be explicitly allow-listed even if the SRI is in the CSP
  addToPolicy(policy, "style-src", styleHandler.urls);
  if (inlineScriptHandler.hashValues.length && !policy["style-src"]?.includes("'self'")) {
    addToPolicy(policy, "style-src", "'self'");
  }

  // Be nice and automatically add Google Fonts to the CSP
  if (styleHandler.urls.includes("fonts.googleapis.com") && !policy["font-src"]?.includes(GOOGLE_FONTS_URL)) {
    addToPolicy(policy, "font-src", GOOGLE_FONTS_URL);
  }

  return Object.entries(policy)
    .map(([name, value]) => `${name} ${value.join(" ")}`)
    .join("; ");
};

export const addToPolicy = (policy: CspPolicy, directive: keyof CspPolicy, hashValues: string) => {
  if (hashValues.length) {
    if (!policy[directive]) {
      policy[directive] = [];
    }

    policy[directive].push(hashValues);
  }
};
