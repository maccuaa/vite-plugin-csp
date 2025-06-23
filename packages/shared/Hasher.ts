import type { HashAlgorithm } from "./types";

export abstract class Hasher {
  abstract update: (input: string) => void;
  abstract digest: () => string;
}

export interface HasherContructor {
  new (algorithm: HashAlgorithm): Hasher;
}
