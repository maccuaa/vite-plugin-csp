import { resolve } from "node:path";
import { $, Glob } from "bun";

const glob = new Glob("**/dist/");

const testPath = resolve(__dirname, "../test/fixtures");

let deleted = 0;
for await (const file of glob.scan({ cwd: testPath, onlyFiles: false })) {
  const toDelete = resolve(testPath, file);
  await $`rm -rf ${toDelete}`;
  deleted++;
}
console.log("Deleted", deleted);
