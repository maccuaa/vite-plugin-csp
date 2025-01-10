import { BaseHandler } from "./BaseHandler.js";
import type { MyHTMLRewriterTypes } from "./internal.js";

export class InlineStyleHandler extends BaseHandler implements MyHTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private textContent = "";

  async element() {
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
