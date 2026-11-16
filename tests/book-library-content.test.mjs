import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../src/content/zh-tw/books/", import.meta.url);
const expected = new Map([
  ["dao-de-jing-qian-yi.md", "a3b789f6-4903-4b5a-95ea-f7cb2a9ac03d"],
  ["lun-yu-qian-yi.md", "54e4b3e8-3f9c-4ac5-a756-3ac84b4fee6c"],
  ["da-xue-qian-yi.md", "5c48f1a1-6578-46b2-9ffb-961a30afd2e8"],
  ["zhong-yong-qian-yi.md", "602d60d3-f59e-44e7-9ca7-d783cc66a1fb"],
  ["chu-xiu-dao-gan-yan.md", "6681b124-5679-46fa-bfa1-d2190f69eeaf"]
]);

test("all five source books are present as complete Traditional Chinese content entries", async () => {
  const files = (await readdir(root)).filter((name) => name.endsWith(".md"));
  assert.deepEqual(new Set(files), new Set(expected.keys()));
  for (const [filename, contentId] of expected) {
    const source = await readFile(new URL(filename, root), "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
    assert.ok(frontmatter, filename + " has frontmatter");
    assert.match(frontmatter[1], new RegExp('contentId: "' + contentId + '"'));
    assert.match(frontmatter[1], /locale: "zh-TW"/);
    assert.match(frontmatter[1], /status: "published"/);
    assert.ok(source.slice(frontmatter[0].length).trim().length > 10000, filename + " includes substantial source text");
    const slug = filename.replace(/\.md$/, "");
    const cover = new URL("../public/books/" + slug + "-cover.webp", import.meta.url);
    assert.ok(existsSync(cover), filename + " has its original cover asset");
    assert.ok(frontmatter[1].includes('image: "/books/' + slug + '-cover.webp"'), filename + " references its local cover");
    assert.ok(frontmatter[1].includes("imageAlt:"), filename + " has descriptive cover alt text");
  }
});

test("D1 book section importer covers all five catalog identities", async () => {
  const script = await readFile(new URL("../scripts/import-book-sections-to-d1.mjs", import.meta.url), "utf8");
  for (const [slug, id] of expected) {
    assert.ok(script.includes('["' + slug.replace(".md", "") + '", "' + id + '"]'));
  }
  assert.match(script, /INSERT OR REPLACE INTO book_sections/);
  assert.match(script, /content_status = 'text_imported'/);
});
