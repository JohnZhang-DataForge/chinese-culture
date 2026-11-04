import { test, expect } from "@playwright/test";

const requireAdmin = process.env.QA_REQUIRE_ADMIN === "true";
const contentApi = process.env.QA_ADMIN_CONTENT_API_PATH || "/api/admin/content";
const mediaApi = process.env.QA_ADMIN_MEDIA_API_PATH;
const accessJwt = process.env.QA_ACCESS_JWT;
const isPreview = process.env.QA_ENVIRONMENT === "preview";

test.describe("Admin API security", () => {
  test("anonymous requests cannot read managed content", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is merged.");
    const response = await request.get(contentApi);
    expect([401, 403]).toContain(response.status());
  });

  test("invalid Cloudflare Access JWT is rejected", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is merged.");
    const response = await request.get(contentApi, {
      headers: { "Cf-Access-Jwt-Assertion": "invalid.qa.jwt" }
    });
    expect([401, 403]).toContain(response.status());
  });

  test("anonymous write requests are rejected", async ({ request }) => {
    test.skip(!requireAdmin, "Set QA_REQUIRE_ADMIN=true after the backend API contract is merged.");
    const response = await request.post(contentApi, {
      data: { type: "article", slug: "qa-unauthorized-write", title: "Must not be created" }
    });
    expect([401, 403]).toContain(response.status());
  });

  test("authenticated malformed content is rejected without a write", async ({ request }) => {
    test.skip(!requireAdmin || !isPreview || !accessJwt, "Requires owner authorization against an isolated preview environment.");
    const response = await request.post(contentApi, {
      headers: { "Cf-Access-Jwt-Assertion": accessJwt! },
      data: JSON.parse('{"__proto__":{"polluted":true},"slug":"../escape","status":"published"}')
    });
    expect([400, 415, 422]).toContain(response.status());
  });

  test("authenticated path traversal does not expose repository files", async ({ request }) => {
    test.skip(!requireAdmin || !isPreview || !accessJwt, "Requires owner authorization against an isolated preview environment.");
    const response = await request.get(`${contentApi.replace(/\/$/, "")}/..%2F..%2FREADME.md`, {
      headers: { "Cf-Access-Jwt-Assertion": accessJwt! }
    });
    expect([400, 403, 404]).toContain(response.status());
    const body = await response.text();
    expect(body).not.toMatch(/CLOUDFLARE_API_TOKEN|BEGIN (RSA|OPENSSH) PRIVATE KEY/i);
  });

  test("invalid media uploads are rejected", async ({ request }) => {
    test.skip(!requireAdmin || !isPreview || !accessJwt || !mediaApi, "Requires the media API contract and owner authorization on preview.");
    const response = await request.post(mediaApi!, {
      headers: { "Cf-Access-Jwt-Assertion": accessJwt! },
      multipart: {
        file: {
          name: "qa-invalid-image.png",
          mimeType: "image/png",
          buffer: Buffer.from("<html><script>alert(1)</script></html>")
        }
      }
    });
    expect([400, 415, 422]).toContain(response.status());
  });
});
