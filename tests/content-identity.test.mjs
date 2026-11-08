import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const contentRoot = join(process.cwd(), "src", "content");
const expectedLocales = new Set(["en", "zh-CN", "es"]);

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

test("all published article files have stable content IDs and matching locale metadata", () => {
  const files = markdownFiles(contentRoot);
  assert.equal(files.length, 39, "expected 13 article concepts across three locales");
  const byContentId = new Map();

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `missing frontmatter: ${relative(contentRoot, file)}`);

    const contentId = frontmatter[1].match(/^contentId:\s*["']?([0-9a-f-]+)["']?\s*$/m)?.[1];
    const locale = frontmatter[1].match(/^locale:\s*["']?([A-Za-z-]+)["']?\s*$/m)?.[1];
    assert.match(contentId ?? "", /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, `invalid contentId: ${relative(contentRoot, file)}`);

    const relativePath = relative(contentRoot, file).split(/[\\/]/);
    const expectedLocale = relativePath[0] === "zh-cn" ? "zh-CN" : relativePath[0] === "es" ? "es" : "en";
    assert.equal(locale, expectedLocale, `locale metadata must match folder: ${relative(contentRoot, file)}`);
    assert.ok(expectedLocales.has(locale), `unsupported locale: ${locale}`);

    const collection = expectedLocale === "en" ? relativePath[0] : relativePath[1];
    const slug = relativePath.at(-1).replace(/\.md$/, "");
    const existing = byContentId.get(contentId) ?? [];
    existing.push({ locale, collection, slug, file });
    byContentId.set(contentId, existing);
  }

  assert.equal(byContentId.size, 13, "expected 13 conceptual content IDs");
  for (const [contentId, variants] of byContentId) {
    assert.equal(variants.length, 3, `contentId ${contentId} must have exactly three locale variants`);
    assert.deepEqual(new Set(variants.map((variant) => variant.locale)), expectedLocales);
    assert.equal(new Set(variants.map((variant) => variant.collection)).size, 1, `collection mismatch for ${contentId}`);
  }
});

import { deterministicContentId, resolveContentIdentity } from "../scripts/content-identity.mjs";

test("explicit contentId survives a locale-specific slug change", () => {
  const id = "5e6ce811-787f-523b-81e2-761c7ee6017d";
  assert.equal(resolveContentIdentity({ contentId: id, locale: "es" }, "es", "books", "viaje-al-oeste"), id);
});

test("legacy content without contentId receives a deterministic fallback", () => {
  const first = resolveContentIdentity({}, "en", "books", "journey-to-the-west");
  const second = resolveContentIdentity({}, "en", "books", "journey-to-the-west");
  assert.equal(first, second);
  assert.equal(first, deterministicContentId("books", "journey-to-the-west"));
});

test("importer rejects a locale field that disagrees with the locale folder", () => {
  assert.throws(
    () => resolveContentIdentity({ contentId: "5e6ce811-787f-523b-81e2-761c7ee6017d", locale: "en" }, "zh-CN", "books", "journey-to-the-west"),
    /Locale metadata mismatch/
  );
});

test("importer rejects malformed immutable content IDs", () => {
  assert.throws(
    () => resolveContentIdentity({ contentId: "not-a-uuid", locale: "en" }, "en", "books", "journey-to-the-west"),
    /Invalid immutable contentId/
  );
});
