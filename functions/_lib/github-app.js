const API_ROOT = "https://api.github.com";
const API_VERSION = "2022-11-28";
// Stable GitHub repository ID for JohnZhang-DataForge/chinese-culture.
const CMS_REPOSITORY_ID = 1444529252;
const encoder = new TextEncoder();

export function isGithubAppConfigured(env) {
  return Boolean(env?.GITHUB_APP_ID && env?.GITHUB_INSTALLATION_ID && env?.GITHUB_APP_PRIVATE_KEY);
}

function concatBytes(...parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function derLength(length) {
  if (length < 128) return Uint8Array.of(length);
  const bytes = [];
  let value = length;
  while (value > 0) { bytes.unshift(value & 255); value >>>= 8; }
  return Uint8Array.of(0x80 | bytes.length, ...bytes);
}

function der(tag, value) {
  return concatBytes(Uint8Array.of(tag), derLength(value.length), value);
}

function pkcs1ToPkcs8(pkcs1) {
  const version = der(0x02, Uint8Array.of(0));
  const rsaEncryptionOid = Uint8Array.of(
    0x30,0x0d,0x06,0x09,0x2a,0x86,0x48,0x86,0xf7,0x0d,0x01,0x01,0x01,0x05,0x00
  );
  const privateKey = der(0x04, pkcs1);
  return der(0x30, concatBytes(version, rsaEncryptionOid, privateKey));
}

function pemBytes(pem) {
  const normalized = String(pem).replace(/\\n/g, "\n").trim();
  const body = normalized.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { bytes, pkcs1: normalized.includes("BEGIN RSA PRIVATE KEY") };
}

function base64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function appJwt(env) {
  const parsed = pemBytes(env.GITHUB_APP_PRIVATE_KEY);
  const pkcs8 = parsed.pkcs1 ? pkcs1ToPkcs8(parsed.bytes) : parsed.bytes;
  const key = await crypto.subtle.importKey(
    "pkcs8", pkcs8, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = base64Url(encoder.encode(JSON.stringify({
    iat: now - 60, exp: now + 540, iss: String(env.GITHUB_APP_ID)
  })));
  const signingInput = header + "." + payload;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(signingInput));
  return signingInput + "." + base64Url(new Uint8Array(signature));
}

async function githubRequest(path, token, options = {}) {
  const response = await fetch(API_ROOT + path, {
    method: options.method || "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": API_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
  });
  const raw = await response.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { data = { message: raw.slice(0, 500) }; } }
  if (!response.ok) {
    const error = new Error("GitHub API request failed (" + response.status + "): " + (data?.message || "Unknown error"));
    error.status = response.status;
    error.github = data;
    throw error;
  }
  return data;
}

export async function getInstallationToken(env) {
  if (!isGithubAppConfigured(env)) {
    const error = new Error("GitHub App credentials are not configured for publication.");
    error.code = "github_app_not_configured";
    error.status = 503;
    throw error;
  }
  const jwt = await appJwt(env);
  const token = await githubRequest(
    "/app/installations/" + encodeURIComponent(String(env.GITHUB_INSTALLATION_ID)) + "/access_tokens",
    jwt,
    {
      method: "POST",
      body: {
        repository_ids: [CMS_REPOSITORY_ID],
        permissions: { contents: "write", pull_requests: "write", checks: "read" }
      }
    }
  );
  if (!token?.token) throw new Error("GitHub did not issue an installation token.");
  return token.token;
}

export async function getMainCommit(token, repository) {
  const result = await githubRequest("/repos/" + repository + "/git/ref/heads/main", token);
  if (!result?.object?.sha) throw new Error("Could not resolve the repository main branch.");
  return result.object.sha;
}

export async function createBranch(token, repository, branchName, baseSha) {
  return githubRequest("/repos/" + repository + "/git/refs", token, {
    method: "POST",
    body: { ref: "refs/heads/" + branchName, sha: baseSha }
  });
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function readRepositoryFile(token, repository, path, ref) {
  return githubRequest("/repos/" + repository + "/contents/" + encodePath(path) + "?ref=" + encodeURIComponent(ref), token);
}

export async function writeRepositoryFile(token, repository, path, branchName, content, message, existingSha = null) {
  const bytes = encoder.encode(content);
  return githubRequest("/repos/" + repository + "/contents/" + encodePath(path), token, {
    method: "PUT",
    body: {
      message,
      content: base64(bytes),
      branch: branchName,
      ...(existingSha ? { sha: existingSha } : {})
    }
  });
}

export async function writeRepositoryBinaryFile(token, repository, path, branchName, bytes, message) {
  return githubRequest("/repos/" + repository + "/contents/" + encodePath(path), token, {
    method: "PUT",
    body: { message, content: base64(bytes), branch: branchName }
  });
}

export async function deleteRepositoryFile(token, repository, path, branchName, existingSha, message) {
  return githubRequest("/repos/" + repository + "/contents/" + encodePath(path), token, {
    method: "DELETE",
    body: { message, sha: existingSha, branch: branchName }
  });
}

export async function createRepositoryPullRequest(token, repository, input) {
  return githubRequest("/repos/" + repository + "/pulls", token, {
    method: "POST",
    body: {
      title: input.title,
      body: input.body,
      head: input.head,
      base: "main",
      draft: false,
      maintainer_can_modify: true
    }
  });
}

export async function getRepositoryPullRequest(token, repository, number) {
  return githubRequest("/repos/" + repository + "/pulls/" + encodeURIComponent(String(number)), token);
}

export async function getRepositoryCheckRuns(token, repository, sha) {
  return githubRequest("/repos/" + repository + "/commits/" + encodeURIComponent(sha) + "/check-runs?per_page=100", token);
}
