import { BaseHandler } from "./BaseHandler";
import type { MyHTMLRewriterTypes } from "./internal";

export const ID_ATT_NAME = "x-vite-plugin-csp";

export class InlineScriptHandler extends BaseHandler implements MyHTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private textContent = "";

  async element(element: MyHTMLRewriterTypes.Element) {
    // Check if we're processing an inline script.
    // If yes, wait for the text method to be invoked so we can hash the text content
    if (element.hasAttribute("src")) {
      return;
    }

    // Reset the text content buffer
    this.textContent = "";
  }

  text(chunk: MyHTMLRewriterTypes.Text): void | Promise<void> {
    this.textContent += chunk.text;

    if (chunk.lastInTextNode) {
      this.calculateHash(this.textContent);
    }
  }
}
