import assert from "node:assert/strict";
import test from "node:test";
import { parseFrontmatter, validateVariant } from "../scripts/validate-content.mjs";

const valid = {
  metadata: {
    contentId: "8023e03a-5f06-5f7a-80b3-e3b4ffa97cd2",
    locale: "en",
    title: "A living culture",
    description: "An introduction.",
    category: "Foundations",
    featured: true,
    image: "https://images.example.test/cover.jpg",
    imageAlt: "A traditional building"
  },
  bodyMarkdown: "## Introduction\n\nCulture changes over time.",
  filePath: "src/content/lessons/example.md",
  localeFromPath: "en",
  collection: "lessons",
  slug: "example"
};

test("parses the scalar YAML frontmatter used by the published content contract", () => {
  const parsed = parseFrontmatter('---\nlocale: "zh-CN"\nfeatured: false\norder: 2\ntitle: "文化"\n---\n正文');
  assert.equal(parsed.metadata.locale, "zh-CN");
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
  assert.throws(() => validateVariant({ ...valid, localeFromPath: "es" }), /does not match/);
});

test("rejects malformed slugs and frontmatter slug drift", () => {
  assert.throws(() => validateVariant({ ...valid, slug: "bad--slug" }), /route slug/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, slug: "another-name" } }), /match the existing filename/);
});

test("rejects non-HTTPS legacy image URLs and missing alternative text", () => {
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, image: "http://images.example.test/cover.jpg" } }), /HTTPS/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, imageAlt: "" } }), /imageAlt/);
});

test("rejects invalid publication status and timestamps", () => {
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, status: "queued" } }), /Invalid status/);
  assert.throws(() => validateVariant({ ...valid, metadata: { ...valid.metadata, updatedAt: "not-a-date" } }), /updatedAt/);
});

test("requires Simplified Chinese text for zh-CN variants", () => {
  assert.throws(() => validateVariant({
    ...valid,
    metadata: { ...valid.metadata, locale: "zh-CN", title: "Only English" },
    localeFromPath: "zh-CN"
  }), /Simplified Chinese/);
});
