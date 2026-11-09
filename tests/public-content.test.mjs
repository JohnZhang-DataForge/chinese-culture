import test from "node:test";
import assert from "node:assert/strict";
import { isPublishedContent, buildPublicArticleUrls } from "../src/lib/public-content.mjs";

test("only published variants enter public pages; legacy Markdown defaults to published", () => {
  assert.equal(isPublishedContent({ data: { status: "published" } }), true);
  assert.equal(isPublishedContent({ data: {} }), true);
  assert.equal(isPublishedContent({ data: { status: "draft" } }), false);
  assert.equal(isPublishedContent({ data: { status: "unpublished" } }), false);
});

test("public article URL generation excludes drafts and unpublished records", () => {
  const urls = buildPublicArticleUrls([{
    locale: "en",
    section: "culture",
    entries: [
      { id: "live-story", data: { status: "published" } },
      { id: "legacy-live-story", data: {} },
      { id: "draft-story", data: { status: "draft" } },
      { id: "hidden-story", data: { status: "unpublished" } }
    ]
  }]);
  assert.deepEqual(urls, [
    "/en/culture/live-story/",
    "/en/culture/legacy-live-story/"
  ]);
});
