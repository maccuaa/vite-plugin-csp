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

  const newHtml = new HTMLRewriter()
    .on("script", scriptHandler)
    .on("script", inlineScriptHandler)
    .on("link", styleHandler)
    .on("style", inlineStyleHandler)
    .transform(originalHtml);

  const csp = buildCsp(policy, { scriptHandler, inlineScriptHandler, styleHandler, inlineStyleHandler });

  const metaHandler = new MetaHandler(csp);

  const finalHtml = new HTMLRewriter().on("meta", metaHandler).transform(newHtml);

  await htmlFile.write(finalHtml);
};
