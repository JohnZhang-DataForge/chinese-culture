import assert from "node:assert/strict";

let fetchListener;
globalThis.addEventListener = (type, callback) => {
  assert.equal(type, "fetch");
  fetchListener = callback;
};
await import("../dist-worker/index.js");

async function request(path, method = "GET") {
  let responsePromise;
  fetchListener({
    request: new Request("https://site.example" + path, { method }),
    respondWith(value) { responsePromise = value; }
  });
  return responsePromise;
}

const home = await request("/");
assert.equal(home.status, 200);
assert.match(home.headers.get("content-type"), /text\/html/);
assert.match(await home.text(), /Chinese Culture Atlas/);

const lesson = await request("/learn/01-a-living-culture/");
assert.equal(lesson.status, 200);
assert.match(await lesson.text(), /A Living Culture/);

const css = await request("/_astro/_slug_.4HlZRqjn.css");
assert.equal(css.status, 200);
assert.match(css.headers.get("content-type"), /text\/css/);

const missing = await request("/not-a-real-page/");
assert.equal(missing.status, 404);
assert.match(await missing.text(), /This path has no story yet/);

const head = await request("/", "HEAD");
assert.equal(head.status, 200);
assert.equal(await head.text(), "");

const rejected = await request("/", "POST");
assert.equal(rejected.status, 405);

console.log("PASS: embedded Worker serves home, content, CSS, 404, HEAD and rejects unsupported methods.");
