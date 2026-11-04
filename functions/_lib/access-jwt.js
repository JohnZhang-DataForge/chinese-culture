const JWKS_TTL_MS = 5 * 60 * 1000;
const MAX_JWT_LENGTH = 16 * 1024;

const jwksCache = new Map();
const jwksInFlight = new Map();

export class AccessAuthError extends Error {
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AccessAuthError";
    this.status = status;
  }
}

export class AccessConfigError extends Error {
  constructor(message = "Authentication is not configured") {
    super(message);
    this.name = "AccessConfigError";
  }
}

function getIssuer(value) {
  if (typeof value !== "string" || value.length > 255) {
    throw new AccessConfigError();
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new AccessConfigError();
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !url.hostname.endsWith(".cloudflareaccess.com")
  ) {
    throw new AccessConfigError();
  }

  return url.origin;
}

function decodeBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new AccessAuthError();
  }

  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  let binary;
  try {
    binary = atob(padded);
  } catch {
    throw new AccessAuthError();
  }

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function decodeJsonSegment(value) {
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      decodeBase64Url(value)
    );
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JWT object");
    }
    return parsed;
  } catch {
    throw new AccessAuthError();
  }
}

async function loadJwks(issuer, fetcher, forceRefresh = false) {
  const cached = jwksCache.get(issuer);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  if (!forceRefresh && jwksInFlight.has(issuer)) {
    return jwksInFlight.get(issuer);
  }

  const pending = (async () => {
    let response;
    try {
      response = await fetcher(issuer + "/cdn-cgi/access/certs", {
        method: "GET",
        headers: { accept: "application/json" },
        redirect: "error"
      });
    } catch {
      throw new AccessConfigError("Unable to retrieve Access signing keys");
    }

    if (!response || !response.ok) {
      throw new AccessConfigError("Unable to retrieve Access signing keys");
    }

    let document;
    try {
      document = await response.json();
    } catch {
      throw new AccessConfigError("Invalid Access signing-key response");
    }

    if (!document || !Array.isArray(document.keys)) {
      throw new AccessConfigError("Invalid Access signing-key response");
    }

    const keys = document.keys.filter((key) =>
      key &&
      key.kty === "RSA" &&
      typeof key.kid === "string" &&
      typeof key.n === "string" &&
      typeof key.e === "string" &&
      (!key.use || key.use === "sig") &&
      (!key.alg || key.alg === "RS256")
    );

    if (keys.length === 0) {
      throw new AccessConfigError("No usable Access signing keys");
    }

    jwksCache.set(issuer, {
      keys,
      expiresAt: Date.now() + JWKS_TTL_MS
    });
    return keys;
  })();

  jwksInFlight.set(issuer, pending);
  try {
    return await pending;
  } finally {
    jwksInFlight.delete(issuer);
  }
}

function audienceMatches(claim, expected) {
  if (typeof claim === "string") return claim === expected;
  return Array.isArray(claim) && claim.some((value) => value === expected);
}

export async function verifyAccessJwt(request, env, options = {}) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token || token.length > MAX_JWT_LENGTH) {
    throw new AccessAuthError();
  }

  const issuer = getIssuer(env.CF_ACCESS_TEAM_DOMAIN);
  const audience = typeof env.CF_ACCESS_AUD === "string"
    ? env.CF_ACCESS_AUD.trim()
    : "";
  const adminEmail = typeof env.ADMIN_EMAIL === "string"
    ? env.ADMIN_EMAIL.trim().toLowerCase()
    : "";

  if (!audience || !adminEmail || !adminEmail.includes("@")) {
    throw new AccessConfigError();
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new AccessAuthError();
  }

  const header = decodeJsonSegment(parts[0]);
  const claims = decodeJsonSegment(parts[1]);

  if (
    header.alg !== "RS256" ||
    typeof header.kid !== "string" ||
    !header.kid ||
    (header.typ !== undefined && header.typ !== "JWT")
  ) {
    throw new AccessAuthError();
  }

  const fetcher = options.fetcher || fetch;
  let keys = await loadJwks(issuer, fetcher);
  let jwk = keys.find((key) => key.kid === header.kid);

  // Refresh once when Cloudflare rotates its signing key.
  if (!jwk) {
    keys = await loadJwks(issuer, fetcher, true);
    jwk = keys.find((key) => key.kid === header.kid);
  }

  if (!jwk) {
    throw new AccessAuthError();
  }

  const cryptoProvider = options.cryptoProvider || globalThis.crypto;
  if (!cryptoProvider || !cryptoProvider.subtle) {
    throw new AccessConfigError("Web Crypto is unavailable");
  }

  let publicKey;
  let signatureValid = false;
  try {
    publicKey = await cryptoProvider.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    );

    signatureValid = await cryptoProvider.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(parts[0] + "." + parts[1])
    );
  } catch {
    throw new AccessAuthError();
  }

  if (!signatureValid) {
    throw new AccessAuthError();
  }

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (
    claims.iss !== issuer ||
    !audienceMatches(claims.aud, audience) ||
    claims.type !== "app" ||
    typeof claims.sub !== "string" ||
    claims.sub.length === 0 ||
    !Number.isFinite(claims.exp) ||
    claims.exp <= now ||
    !Number.isFinite(claims.iat) ||
    claims.iat > now + 60 ||
    (claims.nbf !== undefined &&
      (!Number.isFinite(claims.nbf) || claims.nbf > now))
  ) {
    throw new AccessAuthError();
  }

  const email = typeof claims.email === "string"
    ? claims.email.trim().toLowerCase()
    : "";

  if (!email) {
    throw new AccessAuthError();
  }

  if (email !== adminEmail) {
    throw new AccessAuthError("Forbidden", 403);
  }

  return Object.freeze({
    email,
    subject: claims.sub,
    expiresAt: claims.exp
  });
}

export function resetJwksCacheForTests() {
  jwksCache.clear();
  jwksInFlight.clear();
}
