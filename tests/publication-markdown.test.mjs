import assert from "node:assert/strict";
import test from "node:test";
import { toPublicMarkdown } from "../functions/api/admin/v1/content/[contentId]/submit.js";

const base = {
  contentId: "5e6ce811-787f-523b-81e2-761c7ee6017d",
  locale: "zh-TW",
  title: "《西遊記》：閱讀指南",
  description: "認識孫悟空，以及這部經典冒險故事的豐富層次。",
  category: "古典小說",
  slug: "journey-to-the-west",
  collection: "books",
  status: "published",
  featured: false,
  readingMinutes: 6,
  bodyMarkdown: "## 閱讀之前\n\n這是正文。",
  media: [],
  imageUrl: "https://images.unsplash.com/example.jpg",
  imageAlt: "一本古籍"
};

test("public Markdown export preserves immutable contentId and canonical locale metadata", () => {
  const markdown = toPublicMarkdown(base);
  assert.match(markdown, /^---\ncontentId: "5e6ce811-787f-523b-81e2-761c7ee6017d"\nlocale: "zh-TW"\ntitle:/);
  assert.ok(markdown.includes("## 閱讀之前"));
  assert.ok(markdown.includes('imageAlt: "一本古籍"'));
});

test("public Markdown export rejects snapshots without immutable identity", () => {
  assert.throws(() => toPublicMarkdown({ ...base, contentId: "" }), { code: "invalid_content_id" });
  assert.throws(() => toPublicMarkdown({ ...base, locale: "en" }), { code: "invalid_locale" });
});
