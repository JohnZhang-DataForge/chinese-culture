import {
  CmsError, getVariant, problemResponse, requireDatabase
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

async function finalizeMergedSubmission(db, submission) {
  if (submission.intent === "review") return { synced: true, status: "draft" };
  const current = await getVariant(db, submission.content_id, submission.locale);
  if (!current) return { synced: false, reason: "content_variant_missing" };
  if (Number(current.revision) !== Number(submission.revision)) {
    return { synced: false, reason: "revision_changed_after_submission" };
  }
  const status = submission.intent === "unpublish" ? "unpublished" : "published";
  const now = new Date().toISOString();
  const nextRevision = Number(current.revision) + 1;
  const mutationId = crypto.randomUUID();
  const publishedAt = status === "published" ? (current.publishedAt || now) : (current.publishedAt || null);
  const snapshot = {
    contentId: current.contentId, locale: current.locale, collection: current.collection,
    slug: current.slug, title: current.title, description: current.description,
    category: current.category, status, featured: Boolean(current.featured),
    updatedAt: now, revision: String(nextRevision), readingMinutes: current.readingMinutes,
    bodyMarkdown: current.bodyMarkdown, tags: current.tags || [],
    sources: current.sources || [], media: current.media || []
  };
  if (current.seoTitle) snapshot.seoTitle = current.seoTitle;
  if (current.seoDescription) snapshot.seoDescription = current.seoDescription;
  if (publishedAt) snapshot.publishedAt = publishedAt;
  if (current.order !== undefined) snapshot.order = current.order;
  if (current.level) snapshot.level = current.level;
  if (current.chinese) snapshot.chinese = current.chinese;
  if (current.pinyin) snapshot.pinyin = current.pinyin;
  if (current.imageUrl) snapshot.imageUrl = current.imageUrl;
  if (current.imageAlt) snapshot.imageAlt = current.imageAlt;

  const results = await db.batch([
    db.prepare("UPDATE content_variants SET status = ?, published_at = ?, updated_at = ?, revision = revision + 1, last_mutation_id = ? WHERE content_id = ? AND locale = ? AND revision = ?")
      .bind(status, publishedAt, now, mutationId, current.contentId, current.locale, Number(current.revision)),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) SELECT ?, content_id, locale, revision, ?, ?, ? FROM content_variants WHERE content_id = ? AND locale = ? AND revision = ? AND last_mutation_id = ?")
      .bind(crypto.randomUUID(), "cms-publication-bot@system.local", JSON.stringify(snapshot), now, current.contentId, current.locale, nextRevision, mutationId)
  ]);
  if (!results[0]?.meta?.changes || results[1]?.meta?.changes !== 1) {
    return { synced: false, reason: "database_revision_sync_failed" };
  }
  return { synced: true, status };
}

export async function onRequestGet(context) {
  try {
    const db = requireDatabase(context.env);
    const number = parseNumber(context.params.number);
    const submission = await db.prepare("SELECT * FROM cms_submissions WHERE pr_number = ? ORDER BY created_at DESC LIMIT 1")
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

    let sync = null;
    const state = pull.merged ? "merged" : pull.state === "closed" ? "closed" : "open";
    if (state === "merged" && submission.pr_state !== "merged") {
      sync = await finalizeMergedSubmission(db, submission);
    }
    await db.prepare("UPDATE cms_submissions SET pr_state = ?, merged_at = ?, updated_at = ? WHERE pr_number = ?")
      .bind(state, pull.merged_at || null, new Date().toISOString(), number).run();

    return withApiSecurityHeaders(jsonResponse({
      number,
      state,
      merged: Boolean(pull.merged),
      url: pull.html_url,
      mergeable: Boolean(pull.mergeable),
      checks,
      ...(sync ? { databaseSync: sync } : {})
    }));
  } catch (error) {
    if (error instanceof CmsError) return withApiSecurityHeaders(problemResponse(error));
    if (error?.code === "github_app_not_configured") {
      return withApiSecurityHeaders(problemResponse(new CmsError(503, "github_app_not_configured", "Service Unavailable", "Configure the GitHub App before checking publication PR status.")));
    }
    return withApiSecurityHeaders(problemResponse(new CmsError(502, "github_status_failed", "Bad Gateway", "The publication status could not be retrieved from GitHub.")));
  }
}
