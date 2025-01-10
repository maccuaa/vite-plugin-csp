import type { CryptoHasher } from "bun";
import type { Hasher } from "shared/Hasher";
import type { HashAlgorithm } from "shared/types";

export class BunHash implements Hasher {
  private algorithm: HashAlgorithm;
  private hasher: CryptoHasher;

  constructor(algorithm: HashAlgorithm) {
    this.hasher = new Bun.CryptoHasher(algorithm);
    this.algorithm = algorithm;
  }

  digest(): string {
    const hash = this.hasher.digest("base64");
    this.hasher = new Bun.CryptoHasher(this.algorithm);
    return hash;
  }

  update(contentsToHash: string): void {
    this.hasher.update(contentsToHash, "utf8");
  }
}
