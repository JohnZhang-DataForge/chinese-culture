import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify as verifySignature } from "node:crypto";
import { getInstallationToken, isGithubAppConfigured } from "../functions/_lib/github-app.js";

test("GitHub App PKCS#1 key is converted and signs a short-lived RS256 installation JWT", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" }
  });
  const originalFetch = globalThis.fetch;
  let requestBody = null;
  let requestToken = "";
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /\/app\/installations\/42\/access_tokens$/);
    requestToken = options.headers.Authorization.replace(/^Bearer\s+/, "");
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ token: "test-installation-token" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  };
  try {
    const env = {
      GITHUB_APP_ID: "12345",
      GITHUB_INSTALLATION_ID: "42",
      GITHUB_APP_PRIVATE_KEY: privateKey
    };
    assert.equal(isGithubAppConfigured(env), true);
    assert.equal(await getInstallationToken(env), "test-installation-token");
    const [headerPart, payloadPart, signaturePart] = requestToken.split(".");
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    const signature = Buffer.from(signaturePart, "base64url");
    assert.deepEqual(header, { alg: "RS256", typ: "JWT" });
    assert.equal(payload.iss, "12345");
    assert.ok(payload.exp - payload.iat <= 600);
    assert.equal(verifySignature("RSA-SHA256", Buffer.from(headerPart + "." + payloadPart), publicKey, signature), true);
    assert.deepEqual(requestBody, { permissions: { contents: "write", pull_requests: "write", checks: "read" } });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
