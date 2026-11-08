import { createCsrfToken } from "../../../_lib/csrf.js";
import { isGithubAppConfigured } from "../../../_lib/github-app.js";
import { CmsError, problemResponse } from "../../../_lib/cms.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../_lib/http.js";

export async function onRequestGet(context) {
  try {
    const admin = context.data.admin;
    if (!admin || !admin.email) {
      throw new CmsError(401, "unauthorized", "Unauthorized", "A verified editor identity is required.");
    }
    const secret = context.env.ADMIN_CSRF_SECRET;
    if (typeof secret !== "string" || secret.length < 32) {
      throw new CmsError(503, "admin_api_not_configured", "Service Unavailable", "The CMS session security configuration is incomplete.");
    }

    const csrfToken = await createCsrfToken(admin.email, secret);
    return withApiSecurityHeaders(jsonResponse({
      email: admin.email,
      role: "admin",
      csrfToken,
      repository: "JohnZhang-DataForge/chinese-culture",
      capabilities: { preview: true, publish: isGithubAppConfigured(context.env), mediaUpload: isGithubAppConfigured(context.env) }
    }));
  } catch (error) {
    return withApiSecurityHeaders(problemResponse(error));
  }
}
