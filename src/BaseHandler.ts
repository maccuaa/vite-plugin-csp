import type { CryptoHasher } from "bun";
import type { Config, HashAlgorithm } from "./types";
import { resolvePath } from "./utils";

export class BaseHandler {
  private algorithm: HashAlgorithm;
  private config: Config;

  private hasher: CryptoHasher;
  private hashes: string[] = [];

  constructor(algorithm: HashAlgorithm, config: Config) {
    this.algorithm = algorithm;
    this.hasher = new Bun.CryptoHasher(algorithm);
    this.config = config;
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

  protected getFileContents = async (assetPath: string): Promise<string> => {
    if (assetPath.startsWith("https://")) {
      const response = await fetch(assetPath);
      return await response.text();
    }

    const filepath = resolvePath(assetPath, this.config);

    const fileContents = await Bun.file(filepath).text();

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
