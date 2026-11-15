import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const contentRoot = join(process.cwd(), "src", "content");
const expectedLocales = new Set(["zh-TW"]);

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

test("editorial source tree is intentionally empty after the approved reset", () => {
  const files = markdownFiles(contentRoot);
  assert.equal(files.length, 0, "Old Markdown article snapshots must not remain in the public source tree.");
});

import { deterministicContentId, resolveContentIdentity } from "../scripts/content-identity.mjs";

test("explicit contentId survives a locale-specific slug change", () => {
  const id = "5e6ce811-787f-523b-81e2-761c7ee6017d";
  assert.equal(resolveContentIdentity({ contentId: id, locale: "zh-TW" }, "zh-TW", "books", "journey-to-the-west"), id);
});

test("legacy content without contentId receives a deterministic fallback", () => {
  const first = resolveContentIdentity({}, "zh-TW", "books", "journey-to-the-west");
  const second = resolveContentIdentity({}, "en", "books", "journey-to-the-west");
  assert.equal(first, second);
  assert.equal(first, deterministicContentId("books", "journey-to-the-west"));
});

test("importer rejects a locale field that disagrees with the locale folder", () => {
  assert.throws(
    () => resolveContentIdentity({ contentId: "5e6ce811-787f-523b-81e2-761c7ee6017d", locale: "en" }, "zh-TW", "books", "journey-to-the-west"),
    /Locale metadata mismatch/
  );
});

test("importer rejects malformed immutable content IDs", () => {
  assert.throws(
    () => resolveContentIdentity({ contentId: "not-a-uuid", locale: "zh-TW" }, "zh-TW", "books", "journey-to-the-west"),
    /Invalid immutable contentId/
  );
});
