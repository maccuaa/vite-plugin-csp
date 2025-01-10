import type { CspFileContructor } from "./CspFile.js";
import type { Hasher, HasherContructor } from "./Hasher.js";
import type { Config } from "./internal.js";
import type { HashAlgorithm } from "./types.js";
import { resolvePath } from "./utils.js";

export class BaseHandler {
  private algorithm: HashAlgorithm;
  private config: Config;

  private FileType: CspFileContructor;

  private hasher: Hasher;
  private hashes: string[] = [];

  constructor(
    algorithm: HashAlgorithm,
    config: Config,
    HasherContructor: HasherContructor,
    FileType: CspFileContructor,
  ) {
    this.algorithm = algorithm;
    this.hasher = new HasherContructor(algorithm);
    this.config = config;
    this.FileType = FileType;
  }

  get hashValues() {
    return this.hashes.map((h) => `'${h}'`).join(" ");
  }

  protected calculateHash = (contentsToHash: string) => {
    this.hasher.update(contentsToHash);
    const hashed = this.hasher.digest();

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

    const file = new this.FileType(filepath);

    const fileContents = await file.read();

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
