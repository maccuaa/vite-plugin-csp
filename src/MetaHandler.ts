import type { ScriptHandler } from "./ScriptHandler";
import type { CSPPolicy } from "./types";

export class MetaHandler implements HTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private scriptHandler: ScriptHandler;
  private policy: CSPPolicy;

  constructor(scriptHandler: ScriptHandler, policy: CSPPolicy) {
    this.scriptHandler = scriptHandler;
    this.policy = policy;
  }

  element(element: HTMLRewriterTypes.Element) {
    const attributeName = "http-equiv";

    if (!element.hasAttribute(attributeName)) {
      return;
    }

    const attributeValue = element.getAttribute(attributeName);

    if (attributeValue?.toLowerCase() !== "content-security-policy") {
      return;
    }

    const fileHashes = this.scriptHandler.hashValue;

    if (fileHashes) {
      // Add the file hashes to the correct directive. Try script-src-elem first. Fallback to script-src.
      // If no script-src then create and add the hash to the script-src-elem directive.
      if (this.policy["script-src-elem"]) {
        this.policy["script-src-elem"].push(fileHashes);
      } else if (this.policy["script-src"]) {
        this.policy["script-src"].push(fileHashes);
      } else {
        this.policy["script-src-elem"] = [fileHashes];
      }
    }

    const csp = Object.entries(this.policy)
      .map(([name, value]) => `${name} ${value.join(" ")}`)
      .join("; ");

    element.setAttribute("content", csp);
  }
}
