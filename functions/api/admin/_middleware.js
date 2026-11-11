import {
  AccessAuthError,
  AccessConfigError,
  verifyAccessJwt
} from "../../_lib/access-jwt.js";
import { verifyCsrfToken } from "../../_lib/csrf.js";
import { CmsError, problemResponse } from "../../_lib/cms.js";
import { withApiSecurityHeaders } from "../../_lib/http.js";

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function denied(code = "forbidden", status = 403, diagnostic = null) {
  const title = status === 401 ? "Unauthorized" : status === 503 ? "Service Unavailable" : status === 405 ? "Method Not Allowed" : "Forbidden";
  const detail = status === 503
    ? "The CMS security configuration is unavailable."
    : status === 401
      ? "A valid Cloudflare Access identity is required."
      : status === 405
        ? "The requested method is not supported."
        : "The request was denied.";
  const requestId = crypto.randomUUID();
  if (diagnostic) {
    // Only emit a fixed event name, request ID, URL path and classified error.
    // Never log Access JWTs, request headers, email addresses or secret values.
    console.error("cms_admin_security_diagnostic", {
      requestId,
      code,
      reason: diagnostic.reason,
      path: diagnostic.path
    });
  }
  return withApiSecurityHeaders(problemResponse(new CmsError(status, code, title, detail), requestId));
}

export async function onRequest(context) {
  const request = context.request;
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    return denied("method_not_allowed", 405);
  }

  if (WRITE_METHODS.has(method)) {
    if (typeof context.env.ADMIN_ORIGIN !== "string" || !context.env.ADMIN_ORIGIN) {
      return denied("admin_api_not_configured", 503);
    }
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    if (origin !== context.env.ADMIN_ORIGIN || (fetchSite !== null && fetchSite !== "same-origin")) {
      return denied();
    }
  }

  const requestUrl = new URL(request.url);
  const localAuthBypass = requestUrl.hostname === "localhost"
    && requestUrl.origin === context.env.ADMIN_ORIGIN
    && context.env.CMS_LOCAL_AUTH_BYPASS === "true"
    && typeof context.env.ADMIN_EMAIL === "string"
    && context.env.ADMIN_EMAIL.includes("@");

  try {
    context.data.admin = localAuthBypass
      ? { email: context.env.ADMIN_EMAIL, role: "admin", issuer: "local-development" }
      : await verifyAccessJwt(request, context.env);
  } catch (error) {
    if (error instanceof AccessConfigError) return denied("admin_api_not_configured", 503, { reason: error.message, path: requestUrl.pathname });
    if (error instanceof AccessAuthError) {
      return denied(error.status === 403 ? "forbidden" : "unauthorized", error.status === 403 ? 403 : 401);
    }
    return denied("authentication_unavailable", 503, { reason: error instanceof Error ? error.name : "UnknownError", path: requestUrl.pathname });
  }

  if (WRITE_METHODS.has(method)) {
    const secret = context.env.ADMIN_CSRF_SECRET;
    if (typeof secret !== "string" || secret.length < 32) {
      return denied("admin_api_not_configured", 503);
    }
    const token = request.headers.get("x-csrf-token");
    const valid = await verifyCsrfToken(token, context.data.admin.email, secret);
    if (!valid) return denied("csrf_failed", 403);
  }

  return withApiSecurityHeaders(await context.next());
}
