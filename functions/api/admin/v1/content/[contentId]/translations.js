import {
  CmsError,
  createTranslation,
  problemResponse,
  readContentBody,
  requireContentId,
  requireDatabase,
  validateContentWrite
} from "../../../../../_lib/cms.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../../_lib/http.js";

function errorResponse(error) {
  const message = String(error?.message || "");
  if (/UNIQUE constraint failed|CHECK constraint failed|FOREIGN KEY constraint failed/i.test(message)) {
    error = new CmsError(409, "content_conflict", "Conflict", "A translation for this locale already exists or its slug is already in use.");
  }
  return withApiSecurityHeaders(problemResponse(error));
}

export async function onRequestPost(context) {
  try {
    const db = requireDatabase(context.env);
    const contentId = requireContentId(context.params.contentId);
    const body = await readContentBody(context.request);
    const value = validateContentWrite(body);
    const result = await createTranslation(db, contentId, value, context.data.admin.email);
    return withApiSecurityHeaders(jsonResponse(result, 201, { etag: '"' + result.revision + '"' }));
  } catch (error) {
    return errorResponse(error);
  }
}
