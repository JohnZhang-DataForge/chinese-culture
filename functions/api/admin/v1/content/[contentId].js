import {
  CmsError,
  getVariant,
  problemResponse,
  readContentBody,
  requireContentId,
  requireDatabase,
  requireLocale,
  saveDraft,
  validateContentWrite
} from "../../../../_lib/cms.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../_lib/http.js";

function errorResponse(error) {
  const message = String(error?.message || "");
  if (/UNIQUE constraint failed|CHECK constraint failed|FOREIGN KEY constraint failed/i.test(message)) {
    error = new CmsError(409, "content_conflict", "Conflict", "A content item with the same identity or locale-specific slug already exists.");
  }
  return withApiSecurityHeaders(problemResponse(error));
}

function revisionFromIfMatch(value) {
  if (typeof value !== "string") {
    throw new CmsError(400, "if_match_required", "Bad Request", "If-Match is required.");
  }
  const match = /^"([1-9][0-9]*)"$/.exec(value.trim());
  if (!match) {
    throw new CmsError(400, "invalid_if_match", "Bad Request", "If-Match must contain the quoted D1 revision ETag.");
  }
  const revision = Number(match[1]);
  if (!Number.isSafeInteger(revision)) {
    throw new CmsError(400, "invalid_if_match", "Bad Request", "If-Match revision is invalid.");
  }
  return revision;
}

export async function onRequestGet(context) {
  try {
    const db = requireDatabase(context.env);
    const contentId = requireContentId(context.params.contentId);
    const locale = requireLocale(new URL(context.request.url).searchParams.get("locale"));
    const result = await getVariant(db, contentId, locale);
    if (!result) throw new CmsError(404, "not_found", "Not Found", "The requested locale variant does not exist.");
    return withApiSecurityHeaders(jsonResponse(result, 200, { etag: '"' + result.revision + '"' }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestPut(context) {
  try {
    const db = requireDatabase(context.env);
    const contentId = requireContentId(context.params.contentId);
    const locale = requireLocale(new URL(context.request.url).searchParams.get("locale"));
    const expectedRevision = revisionFromIfMatch(context.request.headers.get("if-match"));
    const body = await readContentBody(context.request);
    const value = validateContentWrite(body);
    if (value.locale !== locale) {
      throw new CmsError(422, "locale_mismatch", "Validation Failed", "The request locale must match the locale query parameter.");
    }
    const result = await saveDraft(db, contentId, locale, value, expectedRevision, context.data.admin.email);
    return withApiSecurityHeaders(jsonResponse(result, 200, { etag: '"' + result.revision + '"' }));
  } catch (error) {
    return errorResponse(error);
  }
}
