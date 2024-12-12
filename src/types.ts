/**
 * The algorithm to use when hashing files for the CSP.
 * Browsers only support `sha256`, `sha384`, or `sha512`
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#hash_algorithm-hash_value
 */
export type HashAlgorithm = "sha256" | "sha384" | "sha512";

/**
 * Fetch directives control the locations from which certain resource types may be loaded.
 */
interface FetchDirectives {
  /**
   * Defines the valid sources for web workers and nested browsing contexts loaded using elements such as `<frame>` and `<iframe>`.
   * Fallback for frame-src and worker-src.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/child-src
   */
  "child-src": string[];

  /**
   * Restricts the URLs which can be loaded using script interfaces.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src
   */
  "connect-src": string[];

  /**
   * Serves as a fallback for the other fetch directives.
   * Fallback for all other fetch directives.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/default-src
   */
  "default-src": string[];

  /**
   * Specifies valid sources for nested browsing contexts loaded into `<fencedframe>` elements.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/fenced-frame-src
   */
  "fenced-frame-src": string[];

  /**
   * Specifies valid sources for fonts loaded using `@font-face`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src
   */
  "font-src": string[];

  /**
   * Specifies valid sources for nested browsing contexts loaded into elements such as `<frame>` and `<iframe>`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-src
   */
  "frame-src": string[];

  /**
   * Specifies valid sources of images and favicons.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src
   */
  "img-src": string[];

  /**
   * Specifies valid sources of application manifest files.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/manifest-src
   */
  "manifest-src": string[];

  /**
   * Specifies valid sources for loading media using the `<audio>`, `<video>` and `<track>` elements.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/media-src
   */
  "media-src": string[];

  /**
   * Specifies valid sources for the `<object>` and `<embed>` elements.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/object-src
   */
  "object-src": string[];

  /**
   * Specifies valid sources to be prefetched or prerendered.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/prefetch-src
   */
  "prefetch-src": string[];

  /**
   * Specifies valid sources for JavaScript and WebAssembly resources.
   * Fallback for `script-src-elem` and `script-src-attr`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
   */
  "script-src": string[];

  /**
   * Specifies valid sources for JavaScript inline event handlers.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src-attr
   */
  "script-src-attr": string[];

  /**
   * Specifies valid sources for JavaScript `<script>` elements.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src-elem
   */
  "script-src-elem": string[];

  /**
   * Specifies valid sources for stylesheets.
   * Fallback for `style-src-elem` and `style-src-attr`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src
   */
  "style-src": string[];

  /**
   * Specifies valid sources for inline styles applied to individual DOM elements.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src-attr
   */
  "style-src-attr": string[];

  /**
   * Specifies valid sources for stylesheets `<style>` elements and `<link>` elements with `rel="stylesheet"`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src-elem
   */
  "style-src-elem": string[];

  /**
   * Specifies valid sources for Worker, SharedWorker, or ServiceWorker scripts.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/worker-src
   */
  "worker-src": string[];
}

/**
 * Document directives govern the properties of a document or worker environment to which a policy applies.
 */
interface DocumentDirectives {
  /**
   * Restricts the URLs which can be used in a document's `<base>` element.
   */
  "base-uri": string[];

  /**
   * Enables a sandbox for the requested resource similar to the `<iframe>` sandbox attribute.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
   */
  sandbox: string[];
}

/**
 * Navigation directives govern to which locations a user can navigate or submit a form, for example.
 */
interface NavigationDirectives {
  /**
   * Restricts the URLs which can be used as the target of a form submissions from a given context.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/form-action
   */
  "form-action": string[];

  /**
   * Specifies valid parents that may embed a page using `<frame>`, `<iframe>`, `<object>`, or `<embed>`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors
   */
  "frame-ancestors": string[];
}

interface OtherDirectives {
  /**
   * Enforces Trusted Types at the DOM XSS injection sinks.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
   */
  "require-trusted-types-for": string[];

  /**
   * Used to specify an allowlist of Trusted Types policies. Trusted Types allows applications to lock down DOM XSS injection sinks to only accept non-spoofable, typed values in place of strings.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/trusted-types
   */
  "trusted-types": string[];

  /**
   * Instructs user agents to treat all of a site's insecure URLs (those served over HTTP) as though they have been replaced with secure URLs (those served over HTTPS). This directive is intended for websites with large numbers of insecure legacy URLs that need to be rewritten.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/upgrade-insecure-requests
   */
  "upgrade-insecure-requests": string[];
}

/**
 * The HTTP Content Security Policy allows you to control resources the user agent is allowed to load for a given page.
 * With a few exceptions, policies mostly involve specifying server origins and script endpoints. This helps guard against cross-site scripting attacks.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 */
export type CSPPolicy = Partial<FetchDirectives & DocumentDirectives & NavigationDirectives & OtherDirectives>;

export interface PluginConfiguration {
  /**
   * What hashing algorithm to use. Default is sha-256.
   * @default "sha256"
   * @example "sha512"
   */
  algorithm?: HashAlgorithm;

  /**
   * Your CSP policy. Learn more about CSP [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
   */
  policy?: CSPPolicy;
}

export type AssetCache = Map<string, string>;
