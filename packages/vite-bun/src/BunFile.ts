import type { CspFile } from "shared/CspFile";

export class BunFile implements CspFile {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async read(): Promise<string> {
    return Bun.file(this.path).text();
  }

  async write(contents: string): Promise<number> {
    return Bun.write(this.path, contents);
  }
}
