import { test, expect } from "@playwright/test";

const requireAdmin = process.env.QA_REQUIRE_ADMIN === "true";
const apiRoot = "/api/admin/v1";
const contentApi = process.env.QA_ADMIN_CONTENT_API_PATH || `${apiRoot}/content?locale=en`;
const accessCookie = process.env.QA_ACCESS_COOKIE;
const isPreview = process.env.QA_ENVIRONMENT === "preview";
const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4321";

test.describe("Admin API security", () => {
  test("anonymous requests cannot read managed content", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is deployed to a test target.");
    const response = await request.get(contentApi, { headers: { Cookie: "" }, maxRedirects: 0 });
    expect([301, 302, 303, 307, 308, 401, 403]).toContain(response.status());
  });

  test("invalid Cloudflare Access JWT is rejected", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is deployed to a test target.");
    const response = await request.get(contentApi, {
      headers: { "Cf-Access-Jwt-Assertion": "invalid.qa.jwt", Cookie: "" },
      maxRedirects: 0
    });
    expect([301, 302, 303, 307, 308, 401, 403]).toContain(response.status());
  });

  test("anonymous write requests are rejected", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is deployed to a test target.");
    const response = await request.post(`${apiRoot}/content`, {
      headers: { Cookie: "" },
      maxRedirects: 0,
      data: {
        locale: "en",
        collection: "culture",
        slug: "qa-unauthorized-write",
        title: "Must not be created",
        description: "Unauthorized write test",
        category: "QA",
        featured: false,
        bodyMarkdown: "Must not be written."
      }
    });
    expect([301, 302, 303, 307, 308, 401, 403]).toContain(response.status());
  });

  test("authenticated malformed content is rejected by schema validation", async ({ request }) => {
    test.skip(!requireAdmin || !isPreview || !accessCookie, "Requires owner authorization against an isolated preview environment.");
    const origin = new URL(baseURL).origin;
    const session = await request.get(`${apiRoot}/session`);
    expect(session.status()).toBe(200);
    const { csrfToken } = await session.json();
    expect(typeof csrfToken).toBe("string");

    const response = await request.post(`${apiRoot}/content`, {
      headers: {
        "X-CSRF-Token": csrfToken,
        Origin: origin,
        "Sec-Fetch-Site": "same-origin"
      },
      data: {
        locale: "en",
        collection: "culture",
        slug: "../escape",
        title: "Invalid QA content",
        description: "Invalid slug must be rejected",
        category: "QA",
        featured: false,
        bodyMarkdown: "Invalid slug."
      }
    });
    expect([400, 422]).toContain(response.status());
  });

  test("authenticated path traversal does not expose repository files", async ({ request }) => {
    test.skip(!requireAdmin || !isPreview || !accessCookie, "Requires owner authorization against an isolated preview environment.");
    const response = await request.get(`${apiRoot}/content/..%2F..%2FREADME.md?locale=en`);
    expect([400, 403, 404]).toContain(response.status());
    const body = await response.text();
    expect(body).not.toMatch(/CLOUDFLARE_API_TOKEN|BEGIN (RSA|OPENSSH) PRIVATE KEY/i);
  });
});
