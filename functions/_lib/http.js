export class RequestValidationError extends Error {
  constructor(message = "Invalid request", status = 400) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

export function jsonResponse(value, status = 200, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(value), { status, headers });
}

export function withApiSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  headers.set("pragma", "no-cache");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "no-referrer");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("content-security-policy", "default-src 'none'; frame-ancestors 'none'");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export async function readJsonBody(request, maxBytes = 1024 * 1024) {
  const contentType = (request.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw new RequestValidationError("Expected application/json", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestValidationError("Request body is too large", 413);
  }

  let bytes;
  try {
    bytes = await request.arrayBuffer();
  } catch {
    throw new RequestValidationError("Unable to read request body", 400);
  }

  if (bytes.byteLength === 0) {
    throw new RequestValidationError("Request body is required", 400);
  }
  if (bytes.byteLength > maxBytes) {
    throw new RequestValidationError("Request body is too large", 413);
  }

  try {
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("JSON body must be an object");
    }
    return parsed;
  } catch {
    throw new RequestValidationError("Invalid JSON request body", 400);
  }
}
