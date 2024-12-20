import { BaseHandler } from "./BaseHandler";

export class InlineStyleHandler extends BaseHandler implements HTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private textContent = "";
  private currentElement?: HTMLRewriterTypes.Element;

  async element(element: HTMLRewriterTypes.Element) {
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
