import {
  AccessAuthError,
  AccessConfigError,
  verifyAccessJwt
} from "../../_lib/access-jwt.js";
import { verifyCsrfToken } from "../../_lib/csrf.js";
import { jsonResponse, withApiSecurityHeaders } from "../../_lib/http.js";

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function denied(code = "forbidden", status = 403) {
  return withApiSecurityHeaders(jsonResponse({ error: code }, status));
}

export async function onRequest(context) {
  const request = context.request;
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    return withApiSecurityHeaders(
      jsonResponse({ error: "method_not_allowed" }, 405, {
        allow: "GET, HEAD, POST, PUT, PATCH, DELETE"
      })
    );
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

  try {
    context.data.admin = await verifyAccessJwt(request, context.env);
  } catch (error) {
    if (error instanceof AccessConfigError) return denied("admin_api_not_configured", 503);
    if (error instanceof AccessAuthError) {
      return denied(error.status === 403 ? "forbidden" : "unauthorized", error.status === 403 ? 403 : 401);
    }
    return denied("authentication_unavailable", 503);
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
