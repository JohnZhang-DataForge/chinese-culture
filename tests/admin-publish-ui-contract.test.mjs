import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/scripts/admin.mjs", import.meta.url), "utf8");

test("publication action shows persistent progress and failure with the failed stage", () => {
  assert.match(source, /setPublicationProgress\(stage \+ " \("/);
  assert.match(source, /setPublicationProgress\("Publication failed during " \+ stage/);
  assert.match(source, /setPublicationProgress\("Publication request created: "/);
  assert.match(source, /button\.setAttribute\("aria-busy", "true"\)/);
  assert.match(source, /button\.removeAttribute\("aria-busy"\)/);
});

test("publication does not rewrite unchanged published variants into drafts", () => {
  assert.match(source, /if \(state\.dirty \|\| !state\.selectedId\) \{\s*stage = "Saving edited language variants";[\s\S]*?await saveLiveDrafts\(\)/);
});

test("publish retains the API revision and waits for a human reviewer", () => {
  assert.match(source, /submitContent\(state\.selectedId,locale,state\.etags\[locale\],intent/);
  assert.match(source, /A reviewer must merge the PR/);
});
