import assert from "node:assert/strict";
import test from "node:test";
import { parseFrontmatter, validateVariant } from "../scripts/validate-content.mjs";

const valid = {
  metadata: {
    contentId: "8023e03a-5f06-5f7a-80b3-e3b4ffa97cd2",
    locale: "zh-TW",
    title: "活態文化",
    description: "認識文化的入門介紹。",
    category: "文化基礎",
    featured: true,
    image: "https://images.example.test/cover.jpg",
    imageAlt: "傳統建築"
  },
  bodyMarkdown: "## 引言\n\n文化隨時間不斷發展。",
  filePath: "src/content/zh-tw/lessons/example.md",
  localeFromPath: "zh-TW",
  collection: "lessons",
  slug: "example"
};

test("parses the scalar YAML frontmatter used by the published content contract", () => {
  const parsed = parseFrontmatter('---\nlocale: "zh-TW"\nfeatured: false\norder: 2\ntitle: "文化"\n---\n正文');
  assert.equal(parsed.metadata.locale, "zh-TW");
  assert.equal(parsed.metadata.featured, false);
  assert.equal(parsed.metadata.order, 2);
  assert.equal(parsed.bodyMarkdown, "正文");
});

test("rejects duplicate frontmatter keys instead of silently taking the last value", () => {
  assert.throws(() => parseFrontmatter("---\ntitle: First\ntitle: Second\n---\nBody"), /Duplicate frontmatter key/);
});

test("accepts a valid legacy published Markdown record", () => {
  assert.equal(validateVariant(valid).status, "published");
});

test("rejects an invalid immutable content ID", () => {
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, contentId: "not-a-uuid" } }), /contentId/);
});

test("rejects locale metadata that disagrees with its directory", () => {
  assert.throws(() => validateVariant({ ...valid, localeFromPath: "en" }), /does not match/);
});

test("rejects malformed slugs and frontmatter slug drift", () => {
  assert.throws(() => validateVariant({ ...valid, slug: "bad--slug" }), /route slug/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, slug: "another-name" } }), /match the existing filename/);
});

test("rejects non-HTTPS legacy image URLs and missing alternative text", () => {
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, image: "http://images.example.test/cover.jpg" } }), /HTTPS/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, imageAlt: "" } }), /imageAlt/);
});

test("accepts root-relative site assets and rejects protocol-relative image URLs", () => {
  assert.equal(validateVariant({ ...valid, metadata: { ...valid.metadata, image: "/books/source-cover.webp" } }).status, "published");
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, image: "//cdn.example.test/cover.webp" } }), /Protocol-relative/);
});

test("rejects invalid publication status and timestamps", () => {
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, status: "queued" } }), /Invalid status/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, updatedAt: "not-a-date" } }), /updatedAt/);
});

test("rejects non-Traditional Chinese locale variants", () => {
  assert.throws(() => validateVariant({
    ...valid,
    metadata: { ...valid.metadata, locale: "en", title: "Only English" },
    localeFromPath: "en"
  }), /Unsupported locale/);
});
