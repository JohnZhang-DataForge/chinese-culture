import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/admin/_middleware.js";

const issuer = "https://yanbozhang.cloudflareaccess.com";
const audience = "test-audience";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function makeAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  return [
    encode({ alg: "RS256", typ: "JWT", kid: "test-key" }),
    encode({
      iss: issuer,
      aud: audience,
      type: "app",
      sub: "test-subject",
      email: "admin@example.test",
      iat: now,
      exp: now + 300
    }),
    "AA"
  ].join(".");
}

async function requestWithFetch(fetcher) {
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: fetcher
  });

  try {
    return await onRequest({
      request: new Request("https://chinese-culture.site/api/admin/v1/session", {
        headers: { "cf-access-jwt-assertion": makeAccessToken() }
      }),
      env: {
        ADMIN_ORIGIN: "https://chinese-culture.site",
        ADMIN_EMAIL: "admin@example.test",
        CF_ACCESS_TEAM_DOMAIN: issuer,
        CF_ACCESS_AUD: audience
      },
      data: {},
      next: async () => new Response("unexpected")
    });
  } finally {
    Object.defineProperty(globalThis, "fetch", originalFetch);
  }
}

test("Admin Access configuration failures return a safe diagnostic code", async () => {
  const response = await onRequest({
    request: new Request("https://chinese-culture.site/api/admin/v1/session", {
      headers: { "cf-access-jwt-assertion": "placeholder-token" }
    }),
    env: {
      ADMIN_ORIGIN: "https://chinese-culture.site",
      ADMIN_EMAIL: "admin@example.test",
      CF_ACCESS_TEAM_DOMAIN: "not-a-valid-access-issuer",
      CF_ACCESS_AUD: audience
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

test("Access signing-key network failures have a distinct safe diagnostic", async () => {
  const response = await requestWithFetch(async () => {
    throw new TypeError("sensitive network detail must not escape");
  });

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.match(body.detail, /Diagnostic: access_signing_keys_fetch_failed\./);
  assert.doesNotMatch(body.detail, /sensitive network detail|admin@example\.test/);
});

test("Access signing-key HTTP failures expose only the HTTP status", async () => {
  const response = await requestWithFetch(async () => new Response("private upstream body", { status: 403 }));

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.match(body.detail, /Diagnostic: access_signing_keys_http_403\./);
  assert.doesNotMatch(body.detail, /private upstream body|admin@example\.test/);
});

test("Access signing-key redirects are not followed and are diagnosed", async () => {
  const response = await requestWithFetch(async () => new Response(null, {
    status: 302,
    headers: { location: "https://example.invalid/redirect-target" }
  }));

  assert.equal(response.status, 503);
  const body = await response.json();
  assert.match(body.detail, /Diagnostic: access_signing_keys_http_302\./);
  assert.doesNotMatch(body.detail, /example\.invalid|redirect-target/);
});
