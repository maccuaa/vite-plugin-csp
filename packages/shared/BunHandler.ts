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
  /** Absolute paths of every HTML file to process. Defaults to a single `index.html` at the build root for backward compatibility. */
  htmlPaths?: string[];
}

export const handler = async ({ algorithm, config, BunHash, BunFile, policy, htmlPaths }: HandlerArgs) => {
  const paths = htmlPaths ?? [resolvePath("index.html", config)];

  for (const htmlPath of paths) {
    await processHtmlFile({ htmlPath, algorithm, config, policy: { ...policy }, BunHash, BunFile });
  }
};

interface ProcessHtmlFileArgs {
  htmlPath: string;
  algorithm: HashAlgorithm;
  config: Config;
  policy: CspPolicy;
  BunHash: HasherContructor;
  BunFile: CspFileContructor;
}

const processHtmlFile = async ({ htmlPath, algorithm, config, policy, BunHash, BunFile }: ProcessHtmlFileArgs) => {
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

  const newHtml = await newHtmlResponse.text();

  const csp = buildCsp(policy, { scriptHandler, inlineScriptHandler, styleHandler, inlineStyleHandler });

  const metaHandler = new MetaHandler(csp);

  const finalHtml = await new HTMLRewriter().on("meta", metaHandler).transform(new Response(newHtml)).text();

  await htmlFile.write(finalHtml);
};
