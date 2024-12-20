import { join, resolve } from "node:path";
import { exists } from "node:fs/promises";

if (Bun.argv.length < 4) {
  console.info("Usage: bun server.ts <base dir> <port>");
  process.exit(1);
}

const baseDir = resolve(Bun.argv[2]);
const rawPort = Bun.argv[3];
const port = Number.parseInt(rawPort);

if (isNaN(port)) {
  console.info("Invalid port", rawPort);
  process.exit(1);
}

if (!baseDir) {
  console.info("Usage: bun server.ts <base dir> <port>");
  process.exit(1);
}

if (!(await exists(baseDir))) {
  console.info("Directory", baseDir, "does not exist");
  process.exit(1);
}

const staticServer = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    const filename = url.pathname === "/" ? "index.html" : url.pathname;

    const fullPath = join(baseDir, filename);

    console.info("🟢", req.method, filename);

    return new Response(Bun.file(fullPath));
  },
});

console.log("🚀", staticServer.url.origin);
console.log("🍦", baseDir);
