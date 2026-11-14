import { CmsError, problemResponse, requireDatabase } from "../../../../../_lib/cms.js";
import { getInstallationToken, getRepositoryPullRequest } from "../../../../../_lib/github-app.js";
import { syncMergedSubmissions } from "../../../../../_lib/publication.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../../_lib/http.js";

const REPOSITORY = "JohnZhang-DataForge/chinese-culture";

function parseNumber(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new CmsError(400, "invalid_pull_request", "Bad Request", "A valid pull request number is required.");
  return number;
}

export async function onRequestPost(context) {
  try {
    const db = requireDatabase(context.env);
    const number = parseNumber(context.params.number);
    const result = await db.prepare("SELECT * FROM cms_submissions WHERE pr_number = ? ORDER BY created_at, submission_id")
      .bind(number).all();
    const submissions = result?.results || [];
    if (!submissions.length) throw new CmsError(404, "submission_not_found", "Not Found", "No CMS submission is associated with this pull request.");

    const token = await getInstallationToken(context.env);
    const pull = await getRepositoryPullRequest(token, REPOSITORY, number);
    const sync = await syncMergedSubmissions(db, submissions, pull);
    if (sync.state === "merged" && sync.databaseSync && !sync.databaseSync.synced) {
      throw new CmsError(409, "publication_sync_conflict", "Conflict", "The pull request is merged, but one or more D1 variants could not be synchronized. Already-synced variants are preserved; retry after resolving the reported revision conflict.");
    }
    return withApiSecurityHeaders(jsonResponse({ number, state: sync.state, databaseSync: sync.databaseSync }));
  } catch (error) {
    if (error instanceof CmsError) return withApiSecurityHeaders(problemResponse(error));
    if (error?.code === "github_app_not_configured") {
      return withApiSecurityHeaders(problemResponse(new CmsError(503, "github_app_not_configured", "Service Unavailable", "Configure the GitHub App before synchronizing publication state.")));
    }
    return withApiSecurityHeaders(problemResponse(new CmsError(502, "github_sync_failed", "Bad Gateway", "The publication state could not be synchronized from GitHub.")));
  }
}
