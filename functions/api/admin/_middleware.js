import {
  AccessAuthError,
  AccessConfigError,
  verifyAccessJwt
} from "../../_lib/access-jwt.js";
import { jsonResponse, withApiSecurityHeaders } from "../../_lib/http.js";

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function onRequest(context) {
  const request = context.request;
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.has(method)) {
    return withApiSecurityHeaders(
      jsonResponse(
        { error: "method_not_allowed" },
        405,
        { allow: "GET, HEAD, POST, PUT, PATCH, DELETE" }
      )
    );
  }

  if (WRITE_METHODS.has(method)) {
    if (typeof context.env.ADMIN_ORIGIN !== "string" || !context.env.ADMIN_ORIGIN) {
      return withApiSecurityHeaders(
        jsonResponse({ error: "admin_api_not_configured" }, 503)
      );
    }

    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");

    if (
      origin !== context.env.ADMIN_ORIGIN ||
      (fetchSite !== null && fetchSite !== "same-origin")
    ) {
      return withApiSecurityHeaders(
        jsonResponse({ error: "forbidden" }, 403)
      );
    }
  }

  try {
    context.data.admin = await verifyAccessJwt(request, context.env);
  } catch (error) {
    if (error instanceof AccessConfigError) {
      return withApiSecurityHeaders(
        jsonResponse({ error: "admin_api_not_configured" }, 503)
      );
    }

    if (error instanceof AccessAuthError) {
      const status = error.status === 403 ? 403 : 401;
      return withApiSecurityHeaders(
        jsonResponse(
          { error: status === 403 ? "forbidden" : "unauthorized" },
          status
        )
      );
    }

    // Fail closed without exposing token, key, or upstream details.
    return withApiSecurityHeaders(
      jsonResponse({ error: "authentication_unavailable" }, 503)
    );
  }

  const response = await context.next();
  return withApiSecurityHeaders(response);
}
