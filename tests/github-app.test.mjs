import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify as verifySignature } from "node:crypto";
import {
  getGithubAppDiagnostics,
  getInstallationToken,
  isGithubAppConfigured
} from "../functions/_lib/github-app.js";

function makeKey(format = "pkcs1") {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: {
      type: format,
      format: "pem"
    }
  });
}

function appEnv(privateKey, overrides = {}) {
  return {
    GITHUB_APP_ID: "12345",
    GITHUB_INSTALLATION_ID: "42",
    GITHUB_APP_PRIVATE_KEY: privateKey,
    ...overrides
  };
}

function tokenResponse(permissions = { contents: "write", pull_requests: "write", checks: "read" }) {
  return {
    token: "test-installation-token",
    permissions
  };
}

async function withFetch(handler, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("GitHub App PKCS#1 key is converted and signs a short-lived RS256 installation JWT", async () => {
  const { privateKey, publicKey } = makeKey("pkcs1");
  let requestBody = null;
  let requestToken = "";
  await withFetch(async (url, options) => {
    assert.match(String(url), /\/app\/installations\/42\/access_tokens$/);
    requestToken = options.headers.Authorization.replace(/^Bearer\s+/, "");
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ token: "test-installation-token" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }, async () => {
    const env = appEnv(privateKey);
    assert.equal(await isGithubAppConfigured(env), true);
    assert.equal(await getInstallationToken(env), "test-installation-token");
  });

  const [headerPart, payloadPart, signaturePart] = requestToken.split(".");
  const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  const signature = Buffer.from(signaturePart, "base64url");
  assert.deepEqual(header, { alg: "RS256", typ: "JWT" });
  assert.equal(payload.iss, "12345");
  assert.ok(payload.exp - payload.iat <= 600);
  assert.equal(verifySignature("RSA-SHA256", Buffer.from(headerPart + "." + payloadPart), publicKey, signature), true);
  assert.deepEqual(requestBody, {
    repository_ids: [1444529252],
    permissions: { contents: "write", pull_requests: "write", checks: "read" }
  });
});

test("configuration validation rejects each missing or malformed identifier without contacting GitHub", async () => {
  const { privateKey } = makeKey();
  const cases = [
    { env: { GITHUB_INSTALLATION_ID: "42", GITHUB_APP_PRIVATE_KEY: privateKey }, missing: ["appIdPresent"] },
    { env: { GITHUB_APP_ID: "12345", GITHUB_APP_PRIVATE_KEY: privateKey }, missing: ["installationIdPresent"] },
    { env: { GITHUB_APP_ID: "12345", GITHUB_INSTALLATION_ID: "42" }, missing: ["privateKeyPresent"] },
    { env: appEnv(privateKey, { GITHUB_APP_ID: " " }), missing: ["appIdPresent"] },
    { env: appEnv(privateKey, { GITHUB_INSTALLATION_ID: "0" }), missing: ["installationIdPresent"] }
  ];
  for (const item of cases) {
    assert.equal(await isGithubAppConfigured(item.env), false);
    const diagnostic = await getGithubAppDiagnostics(item.env);
    assert.equal(diagnostic.code, "github_app_configuration_incomplete");
    assert.deepEqual(diagnostic.missing, item.missing);
  }
});

test("PKCS#8 PEM accepts escaped newlines, CRLF and a base64-wrapped PEM", async () => {
  const { privateKey } = makeKey("pkcs8");
  const variants = [
    privateKey.replace(/\n/g, "\\n"),
    privateKey.replace(/\n/g, "\r\n"),
    Buffer.from(privateKey, "utf8").toString("base64")
  ];
  for (const encodedKey of variants) {
    await withFetch(async (url) => {
      assert.match(String(url), /\/app\/installations\/42\/access_tokens$/);
      return new Response(JSON.stringify({ token: "test-installation-token" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }, async () => {
      const env = appEnv(encodedKey);
      assert.equal(await isGithubAppConfigured(env), true);
      assert.equal(await getInstallationToken(env), "test-installation-token");
    });
  }
});

test("invalid PEM is rejected by configuration validation and produces a safe diagnostic", async () => {
  const env = appEnv("this-is-not-a-private-key");
  assert.equal(await isGithubAppConfigured(env), false);
  const diagnostic = await getGithubAppDiagnostics(env);
  assert.equal(diagnostic.ready, false);
  assert.equal(diagnostic.stage, "jwt");
  assert.equal(diagnostic.code, "github_app_jwt_generation_failed");
  assert.equal(diagnostic.checks.privateKeyPresent, true);
  assert.equal(diagnostic.checks.privateKeyParsed, false);
  assert.doesNotMatch(JSON.stringify(diagnostic), /this-is-not-a-private-key|BEGIN|PRIVATE KEY/);
});

test("a structurally wrapped but invalid DER key fails JWT generation without exposing key material", async () => {
  const env = appEnv("-----BEGIN PRIVATE KEY-----\nAQID\n-----END PRIVATE KEY-----");
  assert.equal(await isGithubAppConfigured(env), false);
  const diagnostic = await getGithubAppDiagnostics(env);
  assert.equal(diagnostic.stage, "jwt");
  assert.equal(diagnostic.code, "github_app_jwt_generation_failed");
  assert.equal(diagnostic.checks.jwtGenerated, false);
});

test("failed GitHub App installation authentication returns a stable safe diagnostic", async () => {
  const { privateKey } = makeKey();
  const diagnostic = await withFetch(async (url, options) => {
    if (String(url).endsWith("/app/installations/42")) {
      return new Response(JSON.stringify({ account: { login: "JohnZhang-DataForge" }, repository_selection: "selected" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    assert.match(String(url), /\/app\/installations\/42\/access_tokens$/);
    assert.equal(options.method, "POST");
    return new Response(JSON.stringify({ message: "Bad credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }, () => getGithubAppDiagnostics(appEnv(privateKey)));

  assert.equal(diagnostic.ready, false);
  assert.equal(diagnostic.stage, "installation_auth");
  assert.equal(diagnostic.code, "github_app_jwt_rejected");
  assert.equal(diagnostic.httpStatus, 401);
  assert.equal(diagnostic.checks.privateKeyParsed, true);
  assert.equal(diagnostic.checks.jwtGenerated, true);
  assert.equal(diagnostic.checks.installationTokenIssued, false);
  assert.equal(diagnostic.installationAccount, "JohnZhang-DataForge");
  assert.equal(diagnostic.repositorySelection, "selected");
  assert.doesNotMatch(JSON.stringify(diagnostic), /Bad credentials|test-installation-token/);
});

test("installation ownership, repository scope, token permissions and main access are verified without returning the token", async () => {
  const { privateKey } = makeKey();
  const requested = [];
  const diagnostic = await withFetch(async (url, options) => {
    requested.push(String(url));
    if (String(url).endsWith("/app/installations/42")) {
      assert.equal(options.headers.Authorization.startsWith("Bearer "), true);
      return new Response(JSON.stringify({
        account: { login: "JohnZhang-DataForge" },
        repository_selection: "selected"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (String(url).endsWith("/access_tokens")) {
      return new Response(JSON.stringify(tokenResponse()), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    assert.equal(options.headers.Authorization, "Bearer test-installation-token");
    return new Response(JSON.stringify({ object: { sha: "a".repeat(40) } }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }, () => getGithubAppDiagnostics(appEnv(privateKey)));

  assert.equal(diagnostic.ready, true);
  assert.equal(diagnostic.code, "github_app_ready");
  assert.equal(diagnostic.installationAccount, "JohnZhang-DataForge");
  assert.equal(diagnostic.repositorySelection, "selected");
  assert.deepEqual(diagnostic.permissionChecks, {
    contentsWrite: true,
    pullRequestsWrite: true,
    checksRead: true
  });
  assert.equal(diagnostic.checks.repositoryAccess, true);
  assert.equal(requested.length, 3);
  assert.match(requested[2], /\/repos\/JohnZhang-DataForge\/chinese-culture\/git\/ref\/heads\/main$/);
  assert.doesNotMatch(JSON.stringify(diagnostic), /test-installation-token|BEGIN PRIVATE KEY/);
});

test("missing repository permission is reported without attempting a repository write", async () => {
  const { privateKey } = makeKey();
  const diagnostic = await withFetch(async (url) => {
    if (String(url).endsWith("/app/installations/42")) {
      return new Response(JSON.stringify({
        account: { login: "JohnZhang-DataForge" },
        repository_selection: "selected"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({
      token: "test-installation-token",
      permissions: { contents: "read", pull_requests: "write", checks: "read" }
    }), { status: 201, headers: { "Content-Type": "application/json" } });
  }, () => getGithubAppDiagnostics(appEnv(privateKey)));

  assert.equal(diagnostic.ready, false);
  assert.equal(diagnostic.stage, "permissions");
  assert.equal(diagnostic.code, "github_app_permissions_insufficient");
  assert.equal(diagnostic.permissionChecks.contentsWrite, false);
});


test("installation diagnostics reject a different account and an all-repositories installation", async () => {
  const { privateKey } = makeKey();
  for (const [metadata, expectedCode] of [
    [{ account: { login: "another-org" }, repository_selection: "selected" }, "github_app_installation_account_mismatch"],
    [{ account: { login: "JohnZhang-DataForge" }, repository_selection: "all" }, "github_app_installation_not_repository_scoped"]
  ]) {
    const diagnostic = await withFetch(async () => new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }), () => getGithubAppDiagnostics(appEnv(privateKey)));
    assert.equal(diagnostic.ready, false);
    assert.equal(diagnostic.stage, "installation_lookup");
    assert.equal(diagnostic.code, expectedCode);
  }
});
