import { type CryptoHasher } from "bun";
import type { AssetCache, HashAlgorithm } from "./types";

export class ScriptHandler implements HTMLRewriterTypes.HTMLRewriterElementContentHandlers {
  private algorithm: HashAlgorithm;
  private cache: AssetCache;

  private hasher: CryptoHasher;
  private hashes: string[] = [];

  private textContent = "";
  private currentElement?: HTMLRewriterTypes.Element;

  constructor(algorithm: HashAlgorithm, cache: AssetCache) {
    this.algorithm = algorithm;
    this.hasher = new Bun.CryptoHasher(algorithm);
    this.cache = cache;
  }

  element(element: HTMLRewriterTypes.Element) {
    const attributeName = "src";

    if (!element.hasAttribute(attributeName)) {
      // Processing an inline script. Wait for the text method to be invoked.
      // 1. Save the element.
      // 2. Reset the text content buffer
      this.currentElement = element;
      this.textContent = "";

      return;
    }

    const filePath = element.getAttribute(attributeName);

    if (!filePath) {
      throw new Error(`${attributeName} attribute does not have a value`);
    }

    const contentsToHash = this.cache.get(filePath);

    if (!contentsToHash) {
      throw new Error(`${filePath} not found in cache`);
    }

    this.calculateHash(contentsToHash);
  }

  text(chunk: HTMLRewriterTypes.Text): void | Promise<void> {
    this.textContent += chunk.text;

    if (chunk.lastInTextNode) {
      this.calculateHash(this.textContent);
    }
  }

  get hashValue() {
    return this.hashes.map((h) => `'${h}'`).join(" ");
  }

  private calculateHash = (contentsToHash: string) => {
    const hashed = this.hasher.update(contentsToHash).digest("base64");

    const cspValue = `${this.algorithm}-${hashed}`;

    this.hashes.push(cspValue);

    if (!this.currentElement) {
      throw new Error("calculateHash method called before element was set");
    }

    this.currentElement.setAttribute("integrity", cspValue);
  };
}
