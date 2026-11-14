import { createCsrfToken } from "../../../_lib/csrf.js";
import { getGithubAppDiagnostics, isGithubAppConfigured } from "../../../_lib/github-app.js";
import { CmsError, problemResponse } from "../../../_lib/cms.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../_lib/http.js";

function sessionUnavailable(reason) {
  const requestId = crypto.randomUUID();
  // Emit only a fixed diagnostic code and request ID. Never log the secret,
  // its contents, the editor email, or request headers.
  console.error("cms_admin_session_diagnostic", { requestId, reason });
  const detail = "The CMS session security configuration is incomplete. Diagnostic: " + reason + ".";
  return withApiSecurityHeaders(problemResponse(
    new CmsError(503, "admin_api_not_configured", "Service Unavailable", detail),
    requestId
  ));
}

export async function onRequestGet(context) {
  try {
    const admin = context.data.admin;
    if (!admin || !admin.email) {
      throw new CmsError(401, "unauthorized", "Unauthorized", "A verified editor identity is required.");
    }
    const secret = context.env.ADMIN_CSRF_SECRET;
    if (typeof secret !== "string" || secret.length < 32) {
      return sessionUnavailable("csrf_secret_missing_or_too_short");
    }

    let csrfToken;
    try {
      csrfToken = await createCsrfToken(admin.email, secret);
    } catch {
      return sessionUnavailable("csrf_token_generation_failed");
    }

    const githubAppConfigured = await isGithubAppConfigured(context.env);
    const response = {
      email: admin.email,
      role: "admin",
      csrfToken,
      repository: "JohnZhang-DataForge/chinese-culture",
      capabilities: { preview: true, publish: githubAppConfigured, mediaUpload: githubAppConfigured }
    };
    // Run network-backed GitHub App verification only when an authenticated
    // administrator explicitly requests diagnostics. Normal session bootstrap
    // remains fast and does not mint an installation token.
    if (context.request?.url && new URL(context.request.url).searchParams.get("diagnostics") === "github-app") {
      response.diagnostics = { githubApp: await getGithubAppDiagnostics(context.env) };
    }
    return withApiSecurityHeaders(jsonResponse(response));
  } catch (error) {
    return withApiSecurityHeaders(problemResponse(error));
  }
}
