export const ADMIN_API_BASE = "/api/admin/v1";

export class AdminApiError extends Error {
  constructor(message, status, code = "API_ERROR", details = null) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = details?.requestId || null;
    this.fieldErrors = Array.isArray(details?.errors) ? details.errors : [];
  }
}

let csrfToken = null;

export function setAdminCsrfToken(token) {
  csrfToken = typeof token === "string" && token.length ? token : null;
}

export function clearAdminCsrfToken() {
  csrfToken = null;
}

function parseProblem(raw, status) {
  let payload = null;
  if (raw) {
    try { payload = JSON.parse(raw); }
    catch { payload = { detail: raw }; }
  }
  if (!payload || typeof payload !== "object") payload = {};
  const message = payload.detail || payload.title || payload.message || payload.error ||
    "The admin service could not complete the request.";
  return new AdminApiError(message, status, payload.code || "API_ERROR", payload);
}

/**
 * Same-origin transport for the approved Agent 0 OpenAPI 3.1 contract.
 * Cloudflare Access injects its identity header at the edge. The browser
 * never receives a GitHub credential or forges an Access JWT.
 */
export async function requestAdminApiWithMeta(path, options = {}, fetcher = fetch) {
  if (
    typeof path !== "string" ||
    !(path === ADMIN_API_BASE || path.startsWith(ADMIN_API_BASE + "/")) ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    throw new TypeError("Admin API requests must use the approved same-origin API base.");
  }

  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!csrfToken) {
      throw new AdminApiError("The admin session is not ready. Refresh the session before saving.", 401, "CSRF_SESSION_MISSING");
    }
    headers.set("X-CSRF-Token", csrfToken);
  }

  const request = { method, credentials: "include", headers };
  if (options.ifMatch) headers.set("If-Match", options.ifMatch);

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

  let response;
  try {
    response = await fetcher(path, request);
  } catch {
    throw new AdminApiError("The admin service could not be reached. Please try again.", 503, "SERVICE_UNAVAILABLE");
  }

  if (response.status === 401) {
    clearAdminCsrfToken();
    throw new AdminApiError("Your Cloudflare Access session is missing or has expired. Sign in, then retry.", 401, "AUTH_REQUIRED");
  }
  if (response.status === 403) {
    throw new AdminApiError("Your account does not have permission to perform this action.", 403, "FORBIDDEN");
  }
  if (response.status === 204) {
    return { data: null, status: 204, etag: response.headers?.get?.("ETag") || null, headers: response.headers };
  }

  const raw = await response.text();
  if (!response.ok) throw parseProblem(raw, response.status);

  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { throw new AdminApiError("The admin service returned an invalid response.", response.status, "INVALID_RESPONSE"); }
  }
  return { data, status: response.status, etag: response.headers?.get?.("ETag") || null, headers: response.headers };
}

export async function requestAdminApi(path, options = {}, fetcher = fetch) {
  const result = await requestAdminApiWithMeta(path, options, fetcher);
  return result.data;
}

function queryPath(path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? path + "?" + suffix : path;
}

export async function getAdminSession(fetcher = fetch) {
  const session = await requestAdminApi(ADMIN_API_BASE + "/session", {}, fetcher);
  setAdminCsrfToken(session?.csrfToken);
  return session;
}

export function listContent(params = {}, fetcher = fetch) {
  return requestAdminApi(queryPath(ADMIN_API_BASE + "/content", params), {}, fetcher);
}

export function getContent(contentId, locale, fetcher = fetch) {
  const path = queryPath(ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId), { locale });
  return requestAdminApiWithMeta(path, {}, fetcher);
}

export function createContent(payload, fetcher = fetch) {
  return requestAdminApi(ADMIN_API_BASE + "/content", { method: "POST", body: payload }, fetcher);
}

export function createTranslation(contentId, payload, fetcher = fetch) {
  return requestAdminApi(
    ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId) + "/translations",
    { method: "POST", body: payload },
    fetcher
  );
}

export function saveDraft(contentId, locale, payload, etag, fetcher = fetch) {
  const path = queryPath(ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId), { locale });
  return requestAdminApiWithMeta(path, { method: "PUT", body: payload, ifMatch: etag }, fetcher);
}

export function previewContent(contentId, payload, fetcher = fetch) {
  return requestAdminApi(
    ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId) + "/preview",
    { method: "POST", body: payload },
    fetcher
  );
}

export function uploadMedia(contentId, locale, etag, file, metadata, fetcher = fetch) {
  const form = new FormData();
  form.append("file", file);
  form.append("metadata", JSON.stringify(metadata));
  const path = queryPath(ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId) + "/media", { locale });
  return requestAdminApi(path, { method: "POST", body: form, ifMatch: etag }, fetcher);
}

export function submitContent(contentId, locale, etag, intent, summary = "", fetcher = fetch) {
  const path = queryPath(ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId) + "/submit", { locale });
  return requestAdminApi(path, { method: "POST", body: { intent, summary }, ifMatch: etag }, fetcher);
}

export function discardDraft(contentId, locale, fetcher = fetch) {
  const path = queryPath(ADMIN_API_BASE + "/content/" + encodeURIComponent(contentId) + "/draft", { locale });
  return requestAdminApi(path, { method: "DELETE" }, fetcher);
}

export function getPullRequestStatus(number, fetcher = fetch) {
  return requestAdminApi(ADMIN_API_BASE + "/pull-requests/" + encodeURIComponent(number), {}, fetcher);
}
