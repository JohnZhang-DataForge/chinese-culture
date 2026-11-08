import {
  deleteDraft,
  problemResponse,
  requireContentId,
  requireDatabase,
  requireLocale
} from "../../../../../_lib/cms.js";
import { withApiSecurityHeaders } from "../../../../../_lib/http.js";

export async function onRequestDelete(context) {
  try {
    const db = requireDatabase(context.env);
    const contentId = requireContentId(context.params.contentId);
    const locale = requireLocale(new URL(context.request.url).searchParams.get("locale"));
    await deleteDraft(db, contentId, locale);
    return withApiSecurityHeaders(new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store" }
    }));
  } catch (error) {
    return withApiSecurityHeaders(problemResponse(error));
  }
}
