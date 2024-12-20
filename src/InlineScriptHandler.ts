import { BaseHandler } from "./BaseHandler";

// You use the Subresource Integrity feature by
// specifying a base64-encoded cryptographic hash
// of a resource (file) you're telling the browser
// to fetch, in the value of the integrity attribute
// of a <script> element or a <link> element with
//  rel="stylesheet", rel="preload", or rel="modulepreload".

export class InlineScriptHandler extends BaseHandler implements HTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private textContent = "";
  private currentElement?: HTMLRewriterTypes.Element;

  async element(element: HTMLRewriterTypes.Element) {
    // Check if we're processing an inline script.
    // If yes, wait for the text method to be invoked so we can hash the text content
    if (element.hasAttribute("src")) {
      return;
    }

    // 1. Save the element.
    // 2. Reset the text content buffer
    this.currentElement = element;
    this.textContent = "";
  }

  text(chunk: HTMLRewriterTypes.Text): void | Promise<void> {
    this.textContent += chunk.text;

    if (chunk.lastInTextNode) {
      const hash = this.calculateHash(this.textContent);

      if (!this.currentElement) {
        throw new Error("text method called before element was set");
      }

      this.currentElement.setAttribute("integrity", hash);
    }
  }
}
