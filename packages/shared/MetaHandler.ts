import type { MyHTMLRewriterTypes } from "./internal.js";

const httpEquivAttribute = "http-equiv";
const contentAttribute = "content";

export class MetaHandler implements MyHTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private csp = "";

  constructor(csp: string) {
    this.csp = csp;
  }

  element(element: MyHTMLRewriterTypes.Element): void | Promise<void> {
    const httpEquiv = element.getAttribute(httpEquivAttribute);

    // Check if we're processing the Content Security Policy meta tag
    if (!httpEquiv || httpEquiv.toLowerCase() !== "content-security-policy") {
      return;
    }

    element.setAttribute(contentAttribute, this.csp);
  }
}
