import { type Hash, createHash } from "node:crypto";
import type { Hasher } from "shared/Hasher";
import type { HashAlgorithm } from "shared/types";

export class NodeHash implements Hasher {
  private algorithm: HashAlgorithm;
  private hasher: Hash;

  constructor(algorithm: HashAlgorithm) {
    this.hasher = createHash(algorithm);
    this.algorithm = algorithm;
  }

  digest() {
    const hash = this.hasher.digest("base64");
    this.hasher = createHash(this.algorithm);
    return hash;
  }

  update(contentsToHash: string) {
    this.hasher.update(contentsToHash, "utf8");
  }
}
