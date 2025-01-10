import type { InlineScriptHandler } from "./InlineScriptHandler.js";
import type { InlineStyleHandler } from "./InlineStyleHandler.js";
import type { ScriptHandler } from "./ScriptHandler.js";
import type { StyleHandler } from "./StyleHandler.js";

//
// Internal Types
//

export interface Handlers {
  scriptHandler: ScriptHandler;
  inlineScriptHandler: InlineScriptHandler;
  styleHandler: StyleHandler;
  inlineStyleHandler: InlineStyleHandler;
}

export interface Config {
  outDir: string;
  base: string;
  root: string;
}

export declare namespace MyHTMLRewriterTypes {
  interface HTMLRewriterElementContentHandlers {
    element?(element: Element): void | Promise<void>;
    comments?(comment: Comment): void | Promise<void>;
    text?(text: Text): void | Promise<void>;
  }

  interface Text {
    readonly text: string;
    readonly lastInTextNode: boolean;
    readonly removed: boolean;
    before(content: Content, options?: ContentOptions): Text;
    after(content: Content, options?: ContentOptions): Text;
    replace(content: Content, options?: ContentOptions): Text;
    remove(): Text;
  }

  interface ContentOptions {
    html?: boolean;
  }
  type Content = string;

  interface Comment {
    text: string;
    readonly removed: boolean;
    before(content: Content, options?: ContentOptions): Comment;
    after(content: Content, options?: ContentOptions): Comment;
    replace(content: Content, options?: ContentOptions): Comment;
    remove(): Comment;
  }

  interface Element {
    tagName: string;
    readonly attributes: IterableIterator<string[]>;
    readonly removed: boolean;
    readonly namespaceURI: string;
    getAttribute(name: string): string | null;
    hasAttribute(name: string): boolean;
    setAttribute(name: string, value: string): Element;
    removeAttribute(name: string): Element;
    before(content: Content, options?: ContentOptions): Element;
    after(content: Content, options?: ContentOptions): Element;
    prepend(content: Content, options?: ContentOptions): Element;
    append(content: Content, options?: ContentOptions): Element;
    replace(content: Content, options?: ContentOptions): Element;
    remove(): Element;
    removeAndKeepContent(): Element;
    setInnerContent(content: Content, options?: ContentOptions): Element;
    onEndTag(handler: (tag: EndTag) => void | Promise<void>): void;
  }

  interface EndTag {
    name: string;
    before(content: Content, options?: ContentOptions): EndTag;
    after(content: Content, options?: ContentOptions): EndTag;
    remove(): EndTag;
  }
}
