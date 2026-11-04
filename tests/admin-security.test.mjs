import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

import {
  AccessAuthError,
  AccessConfigError,
  resetJwksCacheForTests,
  verifyAccessJwt
} from "../functions/_lib/access-jwt.js";
import {
  assertAllowedRepoPath,
  RepositoryPathError
} from "../functions/_lib/github-api.js";
import { onRequest } from "../functions/api/admin/_middleware.js";

const issuer = "https://team.cloudflareaccess.com";
const audience = "test-admin-audience";
const now = 1_800_000_000;
const env = {
  CF_ACCESS_TEAM_DOMAIN: issuer,
  CF_ACCESS_AUD: audience,
  ADMIN_EMAIL: "owner@example.com",
  ADMIN_ORIGIN: "https://chinese-culture.site"
};

const keyPair = await webcrypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"
  },
  true,
  ["sign", "verify"]
);

const publicJwk = await webcrypto.subtle.exportKey("jwk", keyPair.publicKey);
publicJwk.kid = "unit-test-key";
publicJwk.alg = "RS256";
publicJwk.use = "sig";

function toBase64Url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function makeJwt(overrides = {}, signingKey = keyPair.privateKey, headerOverrides = {}) {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: "unit-test-key",
    ...headerOverrides
  };
  const claims = {
    iss: issuer,
    aud: audience,
    sub: "owner-subject",
    email: "owner@example.com",
    type: "app",
    iat: now - 30,
    exp: now + 300,
    ...overrides
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedClaims = toBase64Url(JSON.stringify(claims));
  const signingInput = encodedHeader + "." + encodedClaims;
  const signature = await webcrypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    signingKey,
    new TextEncoder().encode(signingInput)
  );

  return signingInput + "." + toBase64Url(new Uint8Array(signature));
}

function requestWithToken(token) {
  return new Request("https://chinese-culture.site/api/admin/content", {
    headers: { "cf-access-jwt-assertion": token }
  });
}

async function fakeJwksFetch() {
  return new Response(JSON.stringify({ keys: [publicJwk] }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

test("accepts a valid, correctly signed owner Access application JWT", async () => {
  resetJwksCacheForTests();
  const token = await makeJwt();
  const identity = await verifyAccessJwt(requestWithToken(token), env, {
    fetcher: fakeJwksFetch,
    cryptoProvider: webcrypto,
    nowSeconds: now
  });

  assert.equal(identity.email, "owner@example.com");
  assert.equal(identity.subject, "owner-subject");
  assert.equal(identity.expiresAt, now + 300);
});

test("rejects a missing Access JWT", async () => {
  await assert.rejects(
    verifyAccessJwt(
      new Request("https://chinese-culture.site/api/admin/content"),
      env,
      { cryptoProvider: webcrypto, nowSeconds: now }
    ),
    (error) => error instanceof AccessAuthError && error.status === 401
  );
});

test("rejects a token with an invalid signature", async () => {
  resetJwksCacheForTests();
  const otherPair = await webcrypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );
  const token = await makeJwt({}, otherPair.privateKey);

  await assert.rejects(
    verifyAccessJwt(requestWithToken(token), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessAuthError
  );
});

test("rejects the wrong issuer", async () => {
  resetJwksCacheForTests();
  const token = await makeJwt({ iss: "https://attacker.cloudflareaccess.com" });
  await assert.rejects(
    verifyAccessJwt(requestWithToken(token), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessAuthError
  );
});

test("rejects the wrong audience", async () => {
  resetJwksCacheForTests();
  const token = await makeJwt({ aud: "another-application" });
  await assert.rejects(
    verifyAccessJwt(requestWithToken(token), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessAuthError
  );
});

test("rejects expired and not-yet-valid tokens", async () => {
  resetJwksCacheForTests();
  const expired = await makeJwt({ exp: now - 1 });
  await assert.rejects(
    verifyAccessJwt(requestWithToken(expired), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessAuthError
  );

  const notYetValid = await makeJwt({ nbf: now + 10 });
  await assert.rejects(
    verifyAccessJwt(requestWithToken(notYetValid), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessAuthError
  );
});

test("rejects a valid token for a different email identity", async () => {
  resetJwksCacheForTests();
  const token = await makeJwt({ email: "someone-else@example.com" });
  await assert.rejects(
    verifyAccessJwt(requestWithToken(token), env, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    (error) => error instanceof AccessAuthError && error.status === 403
  );
});

test("fails closed when required Access configuration is missing", async () => {
  const token = await makeJwt();
  await assert.rejects(
    verifyAccessJwt(requestWithToken(token), {
      ...env,
      CF_ACCESS_AUD: ""
    }, {
      fetcher: fakeJwksFetch,
      cryptoProvider: webcrypto,
      nowSeconds: now
    }),
    AccessConfigError
  );
});

test("rejects path traversal, absolute paths, hidden files, and unapproved roots", () => {
  const roots = ["src/content/"];
  assert.equal(
    assertAllowedRepoPath("src/content/lessons/example.md", roots),
    "src/content/lessons/example.md"
  );

  for (const path of [
    "../README.md",
    "/src/content/lessons/example.md",
    "src/content/../../README.md",
    "src/content/%2e%2e/README.md",
    "src\\content\\lessons\\example.md",
    "src/content//example.md",
    "src/content/.env",
    ".github/workflows/deploy.yml",
    "public/uploads/image.png"
  ]) {
    assert.throws(() => assertAllowedRepoPath(path, roots), RepositoryPathError);
  }
});

test("rejects write requests with a foreign Origin before invoking a handler", async () => {
  let handlerCalled = false;
  const response = await onRequest({
    request: new Request("https://chinese-culture.site/api/admin/content", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "content-type": "application/json"
      },
      body: JSON.stringify({ title: "no" })
    }),
    env,
    data: {},
    next: async () => {
      handlerCalled = true;
      return new Response("should not run");
    }
  });

  assert.equal(response.status, 403);
  assert.equal(handlerCalled, false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("rejects anonymous admin API reads before invoking a handler", async () => {
  let handlerCalled = false;
  const response = await onRequest({
    request: new Request("https://chinese-culture.site/api/admin/content"),
    env,
    data: {},
    next: async () => {
      handlerCalled = true;
      return new Response("should not run");
    }
  });

  assert.equal(response.status, 401);
  assert.equal(handlerCalled, false);
});
