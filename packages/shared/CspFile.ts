export abstract class CspFile {
  abstract read: () => Promise<string>;
  abstract write: (contents: string) => Promise<unknown>;
}

export interface CspFileContructor {
  new (path: string): CspFile;
}
