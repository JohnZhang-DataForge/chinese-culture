import {
  CmsError, getVariant, problemResponse, readContentBody, requireContentId,
  requireDatabase, requireLocale
} from "../../../../../_lib/cms.js";
import {
  createBranch, createRepositoryPullRequest, deleteRepositoryFile,
  getInstallationToken, getMainCommit, readRepositoryFile, writeRepositoryFile
} from "../../../../../_lib/github-app.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../../_lib/http.js";

const REPOSITORY = "JohnZhang-DataForge/chinese-culture";

function expectedRevision(value) {
  const match = typeof value === "string" ? /^"([1-9][0-9]*)"$/.exec(value.trim()) : null;
  if (!match) throw new CmsError(400, "if_match_required", "Bad Request", "If-Match must contain the quoted D1 revision ETag.");
  const revision = Number(match[1]);
  if (!Number.isSafeInteger(revision)) throw new CmsError(400, "invalid_if_match", "Bad Request", "The revision ETag is invalid.");
  return revision;
}

const yaml = (value) => JSON.stringify(String(value));

function publicContentPath(variant) {
  if (!["lessons", "culture", "festivals", "books"].includes(variant.collection)) {
    throw new CmsError(422, "unsupported_public_collection", "Validation Failed", "Events are not yet backed by a public Markdown collection.");
  }
  const prefix = variant.locale === "en" ? "" : variant.locale === "zh-CN" ? "zh-cn/" : "es/";
  return "src/content/" + prefix + variant.collection + "/" + variant.slug + ".md";
}

export function toPublicMarkdown(variant) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(variant.contentId || ""))) {
    throw new CmsError(422, "invalid_content_id", "Validation Failed", "A valid immutable contentId is required for public snapshots.");
  }
  if (!["en", "zh-CN", "es"].includes(variant.locale)) {
    throw new CmsError(422, "invalid_locale", "Validation Failed", "A supported locale is required for public snapshots.");
  }
  const lines = [
    "---",
    "contentId: " + yaml(variant.contentId),
    "locale: " + yaml(variant.locale),
    "title: " + yaml(variant.title),
    "description: " + yaml(variant.description),
    "category: " + yaml(variant.category)
  ];
  if (variant.chinese) lines.push("chinese: " + yaml(variant.chinese));
  if (variant.pinyin) lines.push("pinyin: " + yaml(variant.pinyin));
  if (variant.level) lines.push("level: " + yaml(variant.level));
  if (typeof variant.order === "number") lines.push("order: " + variant.order);
  lines.push("readingMinutes: " + Number(variant.readingMinutes || 5));
  lines.push("featured: " + (variant.featured ? "true" : "false"));
  const cover = variant.media?.[0];
  const imageUrl = cover?.src ? (cover.src.startsWith("/") ? "https://chinese-culture.site" + cover.src : cover.src) : variant.imageUrl;
  const imageAlt = cover?.alt || variant.imageAlt;
  if (imageUrl) lines.push("image: " + yaml(imageUrl));
  if (imageAlt) lines.push("imageAlt: " + yaml(imageAlt));
  lines.push("---", "", String(variant.bodyMarkdown || "").replace(/^\n+|\n+$/g, ""), "");
  return lines.join("\n");
}

function reviewMarkdown(variant, contentId, revision) {
  return [
    "# Editorial review snapshot",
    "",
    "- Content ID: " + contentId,
    "- Locale: " + variant.locale,
    "- Collection: " + variant.collection,
    "- Slug: " + variant.slug,
    "- Revision: " + revision,
    "",
    "## " + variant.title,
    "",
    variant.description,
    "",
    "---",
    "",
    variant.bodyMarkdown
  ].join("\n");
}

async function readExisting(token, path, branchName) {
  try {
    const file = await readRepositoryFile(token, REPOSITORY, path, branchName);
    return typeof file?.sha === "string" ? file.sha : null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function onRequestPost(context) {
  const db = requireDatabase(context.env);
  let submissionId = null;
  try {
    const contentId = requireContentId(context.params.contentId);
    const locale = requireLocale(new URL(context.request.url).searchParams.get("locale"));
    const revision = expectedRevision(context.request.headers.get("if-match"));
    const body = await readContentBody(context.request);
    const intent = body?.intent;
    const summary = typeof body?.summary === "string" ? body.summary.trim().slice(0, 500) : "";
    if (!["review", "publish", "unpublish"].includes(intent)) {
      throw new CmsError(422, "invalid_intent", "Validation Failed", "intent must be review, publish or unpublish.");
    }

    const variant = await getVariant(db, contentId, locale);
    if (!variant) throw new CmsError(404, "not_found", "Not Found", "The requested content variant does not exist.");
    if (Number(variant.revision) !== revision) {
      throw new CmsError(409, "revision_conflict", "Conflict", "This content has changed since it was loaded. Reload it before submitting.");
    }
    if (intent === "unpublish" && variant.status !== "published") {
      throw new CmsError(409, "not_published", "Conflict", "Only a published variant can be submitted for unpublishing.");
    }
    if (intent === "review" && variant.status !== "draft") {
      throw new CmsError(409, "not_a_draft", "Conflict", "A review-only snapshot is available for draft variants.");
    }

    const open = await db.prepare(
      "SELECT submission_id, branch, pr_number, pr_url, pr_state FROM cms_submissions WHERE content_id = ? AND locale = ? AND revision = ? AND intent = ? AND pr_state IN ('pending', 'open') ORDER BY created_at DESC LIMIT 1"
    ).bind(contentId, locale, revision, intent).first();
    if (open?.pr_url && open?.pr_number) {
      return withApiSecurityHeaders(jsonResponse({ contentId, locale, intent, branch: open.branch, revision: String(revision), submissionId: open.submission_id, pullRequest: { number: Number(open.pr_number), url: open.pr_url, state: open.pr_state } }));
    }

    const now = new Date().toISOString();
    submissionId = crypto.randomUUID();
    const branchName = "cms/" + contentId + "/" + locale + "/" + intent + "-r" + revision + "-" + submissionId.slice(0, 8);
    await db.prepare(
      "INSERT INTO cms_submissions (submission_id, content_id, locale, revision, intent, branch, pr_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
    ).bind(submissionId, contentId, locale, revision, intent, branchName, now, now).run();

    const token = await getInstallationToken(context.env);
    const baseSha = await getMainCommit(token, REPOSITORY);
    await createBranch(token, REPOSITORY, branchName, baseSha);

    let path;
    if (intent === "review") {
      path = "content-reviews/" + contentId + "/" + locale + "-r" + revision + ".md";
      await writeRepositoryFile(token, REPOSITORY, path, branchName, reviewMarkdown(variant, contentId, revision), "cms: add editorial review snapshot");
    } else {
      path = publicContentPath(variant);
      if (intent === "publish") {
        const existingSha = await readExisting(token, path, branchName);
        await writeRepositoryFile(token, REPOSITORY, path, branchName, toPublicMarkdown(variant), "cms: " + (existingSha ? "update" : "publish") + " " + variant.slug, existingSha);
      } else {
        const existingSha = await readExisting(token, path, branchName);
        if (!existingSha) throw new CmsError(409, "public_file_missing", "Conflict", "The published Markdown file was not found on main; no unpublish PR was created.");
        await deleteRepositoryFile(token, REPOSITORY, path, branchName, existingSha, "cms: unpublish " + variant.slug);
      }
    }

    const pr = await createRepositoryPullRequest(token, REPOSITORY, {
      title: "[CMS] " + (intent === "unpublish" ? "Unpublish" : intent === "review" ? "Review" : "Publish") + ": " + variant.title + " (" + locale + ")",
      head: branchName,
      body: [
        "## CMS editorial submission",
        "",
        "- Content ID: `" + contentId + "`",
        "- Locale: `" + locale + "`",
        "- Intent: **" + intent + "**",
        "- D1 revision: `" + revision + "`",
        "- Collection: `" + variant.collection + "`",
        "- Slug: `" + variant.slug + "`",
        "",
        summary || "Submitted from the authenticated Chinese Culture Atlas editorial workspace.",
        "",
        intent === "review"
          ? "This PR contains a non-public editorial review snapshot under `content-reviews/`. Merging it does not publish the article."
          : "This PR changes the static public content source. The website updates only after a reviewer merges the PR and Pages finishes deployment.",
        "",
        "Do not enable auto-merge. Editorial publication requires a human review."
      ].join("\n")
    });

    await db.prepare("UPDATE cms_submissions SET pr_number = ?, pr_url = ?, pr_state = 'open', updated_at = ? WHERE submission_id = ?")
      .bind(pr.number, pr.html_url, new Date().toISOString(), submissionId).run();
    return withApiSecurityHeaders(jsonResponse({
      contentId, locale, intent, branch: branchName, revision: String(revision), submissionId,
      pullRequest: { number: pr.number, url: pr.html_url, state: pr.state || "open" }
    }, 201));
  } catch (error) {
    if (submissionId) {
      try {
        await db.prepare("UPDATE cms_submissions SET pr_state = 'failed', updated_at = ? WHERE submission_id = ? AND pr_state = 'pending'")
          .bind(new Date().toISOString(), submissionId).run();
      } catch {}
    }
    if (error instanceof CmsError) return withApiSecurityHeaders(problemResponse(error));
    if (error?.code === "github_app_not_configured") {
      return withApiSecurityHeaders(problemResponse(new CmsError(503, "github_app_not_configured", "Service Unavailable", "Configure the GitHub App ID, installation ID and private key before enabling publication.")));
    }
    return withApiSecurityHeaders(problemResponse(new CmsError(502, "github_publication_failed", "Bad Gateway", "The publication PR could not be created. No public content was changed.")));
  }
}
