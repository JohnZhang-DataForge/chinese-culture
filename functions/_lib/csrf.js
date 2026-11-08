const encoder = new TextEncoder();
const TOKEN_TTL_SECONDS = 60 * 60;

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid token");
  }
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("CSRF secret is not configured");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createCsrfToken(email, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const expiresAt = nowSeconds + TOKEN_TTL_SECONDS;
  const nonce = crypto.randomUUID();
  const payload = toBase64Url(encoder.encode(JSON.stringify({ email, expiresAt, nonce })));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return payload + "." + toBase64Url(new Uint8Array(signature));
}

export async function verifyCsrfToken(token, email, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof token !== "string" || token.length > 2048) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  try {
    const key = await importHmacKey(secret);
    const payloadBytes = fromBase64Url(parts[0]);
    const signature = fromBase64Url(parts[1]);
    const payloadText = new TextDecoder("utf-8", { fatal: true }).decode(payloadBytes);
    const payload = JSON.parse(payloadText);
    if (
      !payload ||
      payload.email !== email ||
      typeof payload.expiresAt !== "number" ||
      !Number.isInteger(payload.expiresAt) ||
      payload.expiresAt <= nowSeconds ||
      payload.expiresAt > nowSeconds + TOKEN_TTL_SECONDS + 60 ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 16
    ) return false;

    return crypto.subtle.verify("HMAC", key, signature, encoder.encode(parts[0]));
  } catch {
    return false;
  }
}
