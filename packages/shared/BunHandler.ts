import type { CspFileContructor } from "./CspFile";
import type { HasherContructor } from "./Hasher";
import { InlineScriptHandler } from "./InlineScriptHandler";
import { InlineStyleHandler } from "./InlineStyleHandler";
import type { Config } from "./internal";
import { MetaHandler } from "./MetaHandler";
import { ScriptHandler } from "./ScriptHandler";
import { StyleHandler } from "./StyleHandler";
import type { CspPolicy, HashAlgorithm } from "./types";
import { buildCsp, resolvePath } from "./utils";

interface HandlerArgs {
  algorithm: HashAlgorithm;
  config: Config;
  policy: CspPolicy;
  BunHash: HasherContructor;
  BunFile: CspFileContructor;
}

export const handler = async ({ algorithm, config, BunHash, BunFile, policy }: HandlerArgs) => {
  const htmlPath = resolvePath("index.html", config);

  const htmlFile = new BunFile(htmlPath);

  const originalHtml = await htmlFile.read();

  const scriptHandler = new ScriptHandler(algorithm, config, BunHash, BunFile);
  const inlineScriptHandler = new InlineScriptHandler(algorithm, config, BunHash, BunFile);
  const styleHandler = new StyleHandler(algorithm, config, BunHash, BunFile);
  const inlineStyleHandler = new InlineStyleHandler(algorithm, config, BunHash, BunFile);

  const newHtmlResponse = new HTMLRewriter()
    .on("script", scriptHandler)
    .on("script", inlineScriptHandler)
    .on("link", styleHandler)
    .on("style", inlineStyleHandler)
    .transform(new Response(originalHtml));

  // Content handlers above perform async file reads / fetches, so we must
  // pass a Response and await its body instead of transforming a string
  // synchronously. As of Bun 1.4, HTMLRewriter throws if a handler's Promise
  // doesn't resolve within a microtask when transforming a string directly.
  const newHtml = await newHtmlResponse.text();

  const csp = buildCsp(policy, { scriptHandler, inlineScriptHandler, styleHandler, inlineStyleHandler });

  const metaHandler = new MetaHandler(csp);

  const finalHtml = await new HTMLRewriter().on("meta", metaHandler).transform(new Response(newHtml)).text();

  await htmlFile.write(finalHtml);
};
