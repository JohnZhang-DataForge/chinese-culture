import {
  CmsError,
  createContent,
  listContent,
  problemResponse,
  readContentBody,
  requireDatabase,
  validateContentWrite
} from "../../../_lib/cms.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../_lib/http.js";

function errorResponse(error) {
  const message = String(error?.message || "");
  if (/UNIQUE constraint failed|CHECK constraint failed|FOREIGN KEY constraint failed/i.test(message)) {
    error = new CmsError(409, "content_conflict", "Conflict", "A content item with the same identity or locale-specific slug already exists.");
  }
  return withApiSecurityHeaders(problemResponse(error));
}

export async function onRequestGet(context) {
  try {
    const db = requireDatabase(context.env);
    const result = await listContent(db, context.request.url);
    return withApiSecurityHeaders(jsonResponse(result));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestPost(context) {
  try {
    const db = requireDatabase(context.env);
    const body = await readContentBody(context.request);
    const value = validateContentWrite(body);
    const result = await createContent(db, value, context.data.admin.email);
    return withApiSecurityHeaders(jsonResponse(result, 201, { etag: '"' + result.revision + '"' }));
  } catch (error) {
    return errorResponse(error);
  }
}
