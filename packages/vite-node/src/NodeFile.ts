import { readFile, stat, writeFile } from "node:fs/promises";
import type { CspFile } from "shared/CspFile";

export class NodeFile implements CspFile {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async read() {
    return readFile(this.path, { encoding: "utf8" });
  }

  async write(contents: string) {
    return writeFile(this.path, contents, { encoding: "utf8" });
  }
}
