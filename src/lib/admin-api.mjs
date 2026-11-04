export class AdminApiError extends Error {
  constructor(message, status, code = "API_ERROR", details = null) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Same-origin API transport for the Agent 5 contract.
 * Callers must pass an exact path and payload defined by the approved API contract.
 * This module intentionally does not guess routes, create credentials, or call GitHub.
 */
export async function requestAdminApi(path, options = {}, fetcher = fetch) {
  if (typeof path !== "string" || !path.startsWith("/api/")) {
    throw new TypeError("Admin API requests must use a same-origin /api/ path.");
  }
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  const request = {
    method: options.method || "GET",
    credentials: "include",
    headers
  };
  if (options.body !== undefined) {
    if (typeof FormData !== "undefined" && options.body instanceof FormData) {
      request.body = options.body;
    } else if (typeof options.body === "string") {
      request.body = options.body;
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    } else {
      request.body = JSON.stringify(options.body);
      headers.set("Content-Type", "application/json");
    }
  }
  const response = await fetcher(path, request);
  if (response.status === 401) {
    throw new AdminApiError("Your administrator session has expired. Sign in again.", 401, "AUTH_REQUIRED");
  }
  if (response.status === 403) {
    throw new AdminApiError("Your account does not have permission to perform this action.", 403, "FORBIDDEN");
  }
  if (response.status === 204) return null;
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try { payload = JSON.parse(raw); }
    catch { payload = { message: raw }; }
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error || "The admin service could not complete the request.";
    throw new AdminApiError(message, response.status, payload?.code || "API_ERROR", payload);
  }
  return payload;
}
