import { CmsError, problemResponse, readContentBody, requireContentId, validateContentWrite } from "../../../../../_lib/cms.js";
import { renderSafePreview } from "../../../../../_lib/preview.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../../_lib/http.js";

export async function onRequestPost(context) {
  try {
    requireContentId(context.params.contentId);
    const body = await readContentBody(context.request);
    if (!body || typeof body !== "object" || !body.content || typeof body.content !== "object") {
      throw new CmsError(400, "invalid_preview", "Bad Request", "A content object is required for preview.");
    }
    const content = validateContentWrite(body.content);
    return withApiSecurityHeaders(jsonResponse({
      html: renderSafePreview(content),
      warnings: []
    }));
  } catch (error) {
    return withApiSecurityHeaders(problemResponse(error));
  }
}
