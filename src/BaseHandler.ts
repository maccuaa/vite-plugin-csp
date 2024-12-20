import { type CryptoHasher } from "bun";
import type { AssetCache, HashAlgorithm } from "./types";

export class BaseHandler {
  private algorithm: HashAlgorithm;
  private cache: AssetCache;

  private hasher: CryptoHasher;
  private hashes: string[] = [];

  constructor(algorithm: HashAlgorithm, cache: AssetCache) {
    this.algorithm = algorithm;
    this.hasher = new Bun.CryptoHasher(algorithm);
    this.cache = cache;
  }

  get hashValues() {
    return this.hashes.map((h) => `'${h}'`).join(" ");
  }

  protected calculateHash = (contentsToHash: string) => {
    const hashed = this.hasher.update(contentsToHash).digest("base64");

    const hash = `${this.algorithm}-${hashed}`;

    this.saveHash(hash);

    return hash;
  };

  protected getFileContents = async (filePath: string): Promise<string> => {
    if (filePath.startsWith("https://")) {
      const response = await fetch(filePath);
      return await response.text();
    }

    const fileContents = this.cache.get(filePath);

    if (!fileContents) {
      // https://github.com/oven-sh/bun/issues/15852
      // throw new Error(`${filePath} not found in cache`);
      return "";
    }

    return fileContents;
  };

  protected saveHash = (hash: string) => {
    if (!this.hashes.includes(hash)) {
      this.hashes.push(hash);
    }
  };
}
