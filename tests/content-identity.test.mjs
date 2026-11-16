import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const contentRoot = join(process.cwd(), "src", "content");
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

test("editorial source tree contains only the five approved Traditional Chinese source books", () => {
  const files = markdownFiles(contentRoot).map((path) => relative(contentRoot, path).split("/").join("/")).sort();
  const expected = [
    "zh-tw/books/chu-xiu-dao-gan-yan.md",
    "zh-tw/books/da-xue-qian-yi.md",
    "zh-tw/books/dao-de-jing-qian-yi.md",
    "zh-tw/books/lun-yu-qian-yi.md",
    "zh-tw/books/zhong-yong-qian-yi.md"
  ];
  assert.deepEqual(files, expected, "Only the five requested source books should be public editorial Markdown.");

  for (const file of files) {
    const article = readFileSync(join(contentRoot, file), "utf8");
    assert.ok(article.includes('locale: "zh-TW"'), file + " must be Traditional Chinese.");
    assert.ok(article.includes('status: "published"'), file + " must have an explicit publication status.");
    assert.ok(article.includes("## "), file + " must retain the source book's section structure.");
  }
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
