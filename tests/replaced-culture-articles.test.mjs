import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const replacedArticles = [
  "chinese-calligraphy.md",
  "chinese-tea-culture.md",
  "jingdezhen-blue-white-porcelain.md",
  "traditional-chinese-courtyard.md"
];

test("interim culture guides are removed from the public Traditional Chinese collection", () => {
  for (const filename of replacedArticles) {
    assert.equal(existsSync(new URL("../src/content/zh-tw/culture/" + filename, import.meta.url)), false, filename + " must not remain in the public content collection");
  }
});

test("D1 cleanup migration removes the same four superseded CMS records", () => {
  const migration = readFileSync(new URL("../database/migrations/0005_remove_replaced_culture_articles.sql", import.meta.url), "utf8");
  for (const id of [
    "4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1001",
    "4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1002",
    "4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1003",
    "4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1004"
  ]) assert.ok(migration.includes(id), "D1 migration must remove " + id);
  assert.match(migration, /DELETE FROM content_variants/);
  assert.match(migration, /DELETE FROM content_items/);
});
