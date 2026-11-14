import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../functions/api/admin/v1/session.js";
import { verifyCsrfToken } from "../functions/_lib/csrf.js";
import { generateKeyPairSync } from "node:crypto";

const admin = { email: "editor@example.test", role: "admin" };

test("Admin session returns a safe diagnostic when the CSRF secret is missing or too short", async () => {
  for (const secret of [undefined, "", "short-secret"]) {
    const response = await onRequestGet({
      data: { admin },
      env: { ADMIN_CSRF_SECRET: secret }
    });
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.code, "admin_api_not_configured");
    assert.match(body.detail, /Diagnostic: csrf_secret_missing_or_too_short\./);
    assert.ok(body.requestId);
    assert.doesNotMatch(body.detail, /short-secret|editor@example\.test/);
  }
});

test("Admin session creates a verifiable CSRF token when the secret is valid", async () => {
  const secret = "a".repeat(64);
  const response = await onRequestGet({
    data: { admin },
    env: { ADMIN_CSRF_SECRET: secret }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.email, admin.email);
  assert.equal(body.role, "admin");
  assert.equal(typeof body.csrfToken, "string");
  assert.equal(await verifyCsrfToken(body.csrfToken, admin.email, secret), true);
});

test("Admin session does not expose token-generation exception details", async () => {
  const originalCrypto = globalThis.crypto;
  try {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: { randomUUID: () => "test-request-id" }
    });
    const response = await onRequestGet({
      data: { admin },
      env: { ADMIN_CSRF_SECRET: "a".repeat(64) }
    });
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.code, "admin_api_not_configured");
    assert.match(body.detail, /Diagnostic: csrf_token_generation_failed\./);
    assert.equal(body.requestId, "test-request-id");
    assert.doesNotMatch(body.detail, /secret|crypto|TypeError|ReferenceError/);
  } finally {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: originalCrypto
    });
  }
});


test("Admin session capability is false when the GitHub App private key is unavailable", async () => {
  const response = await onRequestGet({
    data: { admin },
    env: { ADMIN_CSRF_SECRET: "a".repeat(64), GITHUB_APP_ID: "5712195", GITHUB_INSTALLATION_ID: "180887271" }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.capabilities.publish, false);
  assert.equal(body.capabilities.mediaUpload, false);
});

test("Admin session enables publication only when the configured private key can generate an App JWT", async () => {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" }
  });
  const response = await onRequestGet({
    data: { admin },
    env: {
      ADMIN_CSRF_SECRET: "a".repeat(64),
      GITHUB_APP_ID: "5712195",
      GITHUB_INSTALLATION_ID: "180887271",
      GITHUB_APP_PRIVATE_KEY: privateKey
    }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.capabilities.publish, true);
  assert.equal(body.capabilities.mediaUpload, true);
  assert.equal(body.diagnostics, undefined);
});

test("opt-in Admin session diagnostics report safe runtime auth stages without exposing credentials", async () => {
  const privateKey = "not-a-valid-private-key";
  const response = await onRequestGet({
    data: { admin },
    request: new Request("https://chinese-culture.site/api/admin/v1/session?diagnostics=github-app"),
    env: {
      ADMIN_CSRF_SECRET: "a".repeat(64),
      GITHUB_APP_ID: "5712195",
      GITHUB_INSTALLATION_ID: "180887271",
      GITHUB_APP_PRIVATE_KEY: privateKey
    }
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.capabilities.publish, false);
  assert.equal(body.diagnostics.githubApp.code, "github_app_jwt_generation_failed");
  assert.equal(body.diagnostics.githubApp.stage, "jwt");
  assert.doesNotMatch(JSON.stringify(body.diagnostics), /not-a-valid-private-key|BEGIN PRIVATE KEY|5712195|180887271/);
});
