import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import assert from "node:assert/strict";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const required = [
  "index.html","learn/index.html","culture/index.html",
  "festivals/index.html","books/index.html","events/index.html",
  "about/index.html","contact/index.html","privacy/index.html",
  "accessibility/index.html","editorial-policy/index.html","404.html"
];
assert.ok(existsSync(dist), "Build output missing. Run npm run build.");
for (const path of required) assert.ok(existsSync(join(dist,path)), "Missing page " + path);
assert.ok(!existsSync(join(dist,"_worker.js")), "Detected SSR Worker output; must remain static.");
const wrangler = readFileSync(join(root,"wrangler.jsonc"),"utf8");
assert.ok(wrangler.includes('"directory": "./dist"'), "Wrong assets directory");
assert.ok(!/"main"\s*:/.test(wrangler), "Unexpected Worker entrypoint");
let count=0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path=join(dir,name);
    if(statSync(path).isDirectory()) walk(path);
    else {count++;assert.ok(statSync(path).size<=25*1024*1024, "Asset too large: "+path);}
  }
}
walk(dist);
assert.ok(count<=20000, "Exceeds Cloudflare Workers Free static asset count");
assert.ok(readFileSync(join(dist,"index.html"),"utf8").includes("Chinese Culture Atlas"), "Missing home page brand");
console.log("PASS: "+required.length+" routes, "+count+" static files, no SSR Worker.");
