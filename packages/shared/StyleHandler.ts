import { BaseHandler } from "./BaseHandler.js";
import type { MyHTMLRewriterTypes } from "./internal.js";

// You use the Subresource Integrity feature by
// specifying a base64-encoded cryptographic hash
// of a resource (file) you're telling the browser
// to fetch, in the value of the integrity attribute
// of a <script> element or a <link> element with
//  rel="stylesheet", rel="preload", or rel="modulepreload".

const hrefAttribute = "href";
const crossOriginAttribute = "crossorigin";
const integrityAttribute = "integrity";
const relAttribute = "rel";

export class StyleHandler extends BaseHandler implements MyHTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  // URLs to add to the CSP
  private urlCache: string[] = [];

  async element(element: MyHTMLRewriterTypes.Element) {
    const rel = element.getAttribute(relAttribute);

    // SRI is only applicable on link elements with the following rel values
    if (!rel || rel !== "stylesheet") {
      return;
    }

    const existingHash = element.getAttribute(integrityAttribute);

    // If the element already has an integrity attribute then skip it
    if (existingHash) {
      this.saveHash(existingHash);
      return;
    }

    const fileUrl = element.getAttribute(hrefAttribute);

    if (!fileUrl) {
      return;
    }

    if (fileUrl.endsWith(".css")) {
      const contentsToHash = await this.getFileContents(fileUrl);

      if (!contentsToHash) {
        return;
      }

      const hash = this.calculateHash(contentsToHash);

      element.setAttribute("integrity", hash);
    }

    // Be nice and save urls so we can automatically add them to the CSP
    if (fileUrl.startsWith("https://")) {
      this.saveUrl(fileUrl);
    }

    // Be nice and fix CORS issues too. Add crossorigin="anonymous"
    if (fileUrl.startsWith("https://") && !element.hasAttribute(crossOriginAttribute)) {
      element.setAttribute(crossOriginAttribute, "anonymous");
    }
  }

  private saveUrl = (fileUrl: string) => {
    const baseUrl = new URL(fileUrl);
    if (!this.urlCache.includes(baseUrl.host) || !this.urlCache.includes(baseUrl.origin)) {
      this.urlCache.push(baseUrl.origin);
    }
  };

  get urls() {
    return this.urlCache.join(" ");
  }
}
