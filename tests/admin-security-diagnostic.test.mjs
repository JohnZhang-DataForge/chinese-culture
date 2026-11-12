import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/admin/_middleware.js";

test("Admin Access configuration failures return a safe diagnostic code", async () => {
  const response = await onRequest({
    request: new Request("https://chinese-culture.site/api/admin/v1/session", {
      headers: { "cf-access-jwt-assertion": "placeholder-token" }
    }),
    env: {
      ADMIN_ORIGIN: "https://chinese-culture.site",
      ADMIN_EMAIL: "admin@example.test",
      CF_ACCESS_TEAM_DOMAIN: "not-a-valid-access-issuer",
      CF_ACCESS_AUD: "test-audience"
    },
    data: {},
    next: async () => new Response("unexpected")
  });

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.code, "admin_api_not_configured");
  assert.match(body.detail, /Diagnostic: access_configuration_missing_or_invalid\./);
  assert.ok(body.requestId);
  assert.doesNotMatch(body.detail, /not-a-valid-access-issuer|admin@example\.test|test-audience/);
});
