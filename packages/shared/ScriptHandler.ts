import { BaseHandler } from "./BaseHandler.js";
import type { MyHTMLRewriterTypes } from "./internal.js";

// You use the Subresource Integrity feature by
// specifying a base64-encoded cryptographic hash
// of a resource (file) you're telling the browser
// to fetch, in the value of the integrity attribute
// of a <script> element or a <link> element with
//  rel="stylesheet", rel="preload", or rel="modulepreload".

const srcAttribute = "src";
const crossOriginAttribute = "crossorigin";
const integrityAttribute = "integrity";

export class ScriptHandler extends BaseHandler implements MyHTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  async element(element: MyHTMLRewriterTypes.Element) {
    const filePath = element.getAttribute(srcAttribute);

    // Check if we're processing an inline script.
    // If yes, skip it.
    if (!filePath) {
      return;
    }

    const existingHash = element.getAttribute(integrityAttribute);

    // If the element already has an integrity attribute then skip it
    if (existingHash) {
      this.saveHash(existingHash);
      return;
    }

    const contentsToHash = await this.getFileContents(filePath);

    if (!contentsToHash) {
      return;
    }

    const hash = this.calculateHash(contentsToHash);

    element.setAttribute("integrity", hash);

    // Be nice and fix CORS issues too. Add crossorigin="anonymous"
    if (filePath.startsWith("https://") && !element.hasAttribute(crossOriginAttribute)) {
      element.setAttribute(crossOriginAttribute, "anonymous");
    }
  }
}
