import test from "node:test";
import assert from "node:assert/strict";
import {
  getContent,
  saveDraft,
  submitContent,
  setAdminCsrfToken,
  clearAdminCsrfToken
} from "../src/lib/admin-api.mjs";

const contentId = "123e4567-e89b-42d3-a456-426614174000";
const payload = {
  locale: "en",
  collection: "culture",
  slug: "calligraphy",
  title: "Calligraphy",
  description: "A test description",
  category: "Arts",
  featured: false,
  tags: [],
  readingMinutes: 5,
  bodyMarkdown: "A test body",
  media: [],
  sources: []
};

test("GET content derives the quoted D1 ETag from the authoritative JSON revision", async () => {
  const result = await getContent(contentId, "en", async () => new Response(
    JSON.stringify({ contentId, locale: "en", revision: 12, title: "Calligraphy" }),
    { status: 200, headers: { "content-type": "application/json", etag: 'W/"edge-generated-tag"' } }
  ));

  assert.equal(result.etag, '"12"');
  assert.equal(result.data.revision, 12);
});

test("GET content derives the quoted D1 ETag when the edge omits ETag", async () => {
  const result = await getContent(contentId, "zh-CN", async () => new Response(
    JSON.stringify({ contentId, locale: "zh-CN", revision: "7", title: "书法" }),
    { status: 200, headers: { "content-type": "application/json" } }
  ));

  assert.equal(result.etag, '"7"');
});

test("saveDraft sends a canonical quoted If-Match header", async () => {
  setAdminCsrfToken("test-csrf-token");
  let request;
  try {
    const result = await saveDraft(contentId, "en", payload, "8", async (_url, options) => {
      request = options;
      return new Response(JSON.stringify({ contentId, locale: "en", revision: 9 }), {
        status: 200,
        headers: { "content-type": "application/json", etag: 'W/"9"' }
      });
    });

    assert.equal(request.headers.get("If-Match"), '"8"');
    assert.equal(result.etag, '"9"');
  } finally {
    clearAdminCsrfToken();
  }
});

test("submitContent sends a canonical quoted If-Match header", async () => {
  setAdminCsrfToken("test-csrf-token");
  let request;
  try {
    await submitContent(contentId, "en", '"9"', "review", "test", async (_url, options) => {
      request = options;
      return new Response(JSON.stringify({ revision: "9", pullRequest: { number: 1 } }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    });

    assert.equal(request.headers.get("If-Match"), '"9"');
  } finally {
    clearAdminCsrfToken();
  }
});

test("write operations reject missing or malformed revision tokens before making a request", async () => {
  let called = false;
  assert.throws(
    () => saveDraft(contentId, "en", payload, 'W/"9"', async () => { called = true; }),
    (error) => error.code === "REVISION_ETAG_MISSING" && error.status === 409
  );
  assert.equal(called, false);
});
