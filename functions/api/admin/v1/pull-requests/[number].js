import {
  CmsError, problemResponse, requireDatabase
} from "../../../../_lib/cms.js";
import {
  getInstallationToken, getRepositoryCheckRuns, getRepositoryPullRequest
} from "../../../../_lib/github-app.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../_lib/http.js";

const REPOSITORY = "JohnZhang-DataForge/chinese-culture";

function parseNumber(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new CmsError(400, "invalid_pull_request", "Bad Request", "A valid pull request number is required.");
  return number;
}

export async function onRequestGet(context) {
  try {
    const db = requireDatabase(context.env);
    const number = parseNumber(context.params.number);
    const submission = await db.prepare("SELECT submission_id, pr_number, pr_url, pr_state FROM cms_submissions WHERE pr_number = ? ORDER BY created_at DESC LIMIT 1")
      .bind(number).first();
    if (!submission) throw new CmsError(404, "submission_not_found", "Not Found", "No CMS submission is associated with this pull request.");

    const token = await getInstallationToken(context.env);
    const pull = await getRepositoryPullRequest(token, REPOSITORY, number);
    let checks = [];
    try {
      const result = await getRepositoryCheckRuns(token, REPOSITORY, pull.head.sha);
      checks = (result.check_runs || []).map((check) => ({
        name: check.name,
        status: check.status === "completed" ? "completed" : check.status,
        conclusion: check.conclusion || null
      }));
    } catch {}

    const state = pull.merged ? "merged" : pull.state === "closed" ? "closed" : "open";
    return withApiSecurityHeaders(jsonResponse({
      number,
      state,
      merged: Boolean(pull.merged),
      mergeable: Boolean(pull.mergeable),
      url: pull.html_url,
      checks
    }));
  } catch (error) {
    if (error instanceof CmsError) return withApiSecurityHeaders(problemResponse(error));
    if (error?.code === "github_app_not_configured") {
      return withApiSecurityHeaders(problemResponse(new CmsError(503, "github_app_not_configured", "Service Unavailable", "Configure the GitHub App before checking publication PR status.")));
    }
    return withApiSecurityHeaders(problemResponse(new CmsError(502, "github_status_failed", "Bad Gateway", "The publication status could not be retrieved from GitHub.")));
  }
}
