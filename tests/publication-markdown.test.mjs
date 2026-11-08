import assert from "node:assert/strict";
import test from "node:test";
import { toPublicMarkdown } from "../functions/api/admin/v1/content/[contentId]/submit.js";

const base = {
  contentId: "5e6ce811-787f-523b-81e2-761c7ee6017d",
  locale: "zh-CN",
  title: "《西游记》：读者指南",
  description: "认识孙悟空，以及这部经典冒险故事的丰富层次。",
  category: "古典小说",
  slug: "journey-to-the-west",
  collection: "books",
  status: "published",
  featured: false,
  readingMinutes: 6,
  bodyMarkdown: "## 阅读之前\n\n这是正文。",
  media: [],
  imageUrl: "https://images.unsplash.com/example.jpg",
  imageAlt: "一本古籍"
};

test("public Markdown export preserves immutable contentId and canonical locale metadata", () => {
  const markdown = toPublicMarkdown(base);
  assert.match(markdown, /^---\ncontentId: "5e6ce811-787f-523b-81e2-761c7ee6017d"\nlocale: "zh-CN"\ntitle:/);
  assert.ok(markdown.includes("## 阅读之前"));
  assert.ok(markdown.includes('imageAlt: "一本古籍"'));
});

test("public Markdown export rejects snapshots without immutable identity", () => {
  assert.throws(() => toPublicMarkdown({ ...base, contentId: "" }), { code: "invalid_content_id" });
  assert.throws(() => toPublicMarkdown({ ...base, locale: "zh-cn" }), { code: "invalid_locale" });
});
