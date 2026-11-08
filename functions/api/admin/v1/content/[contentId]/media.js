import {
  CmsError, getVariant, problemResponse, requireContentId,
  requireDatabase, requireLocale
} from "../../../../../_lib/cms.js";
import {
  createBranch, createRepositoryPullRequest, getInstallationToken,
  getMainCommit, writeRepositoryBinaryFile
} from "../../../../../_lib/github-app.js";
import { jsonResponse, withApiSecurityHeaders } from "../../../../../_lib/http.js";

const REPOSITORY = "JohnZhang-DataForge/chinese-culture";
const MAX_BYTES = 8 * 1024 * 1024;
const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif"
};

function expectedRevision(value) {
  const match = typeof value === "string" ? /^"([1-9][0-9]*)"$/.exec(value.trim()) : null;
  if (!match) throw new CmsError(400, "if_match_required", "Bad Request", "If-Match must contain the quoted D1 revision ETag.");
  return Number(match[1]);
}

function matchesImageSignature(bytes, mime) {
  const ascii = (start, end) => String.fromCharCode(...bytes.subarray(start, end));
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value,index)=>bytes[index]===value);
  if (mime === "image/webp") return bytes.length >= 12 && ascii(0,4) === "RIFF" && ascii(8,12) === "WEBP";
  if (mime === "image/avif") return bytes.length >= 12 && ascii(4,8) === "ftyp" && ["avif","avis"].includes(ascii(8,12));
  return false;
}

function parseMetadata(raw) {
  let metadata;
  try {
    metadata = typeof raw === "string" ? JSON.parse(raw) : null;
  } catch {
    throw new CmsError(400, "invalid_media_metadata", "Bad Request", "Media metadata must be valid JSON.");
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new CmsError(400, "invalid_media_metadata", "Bad Request", "Media metadata is required.");
  }
  const alt = typeof metadata.alt === "string" ? metadata.alt.trim() : "";
  const credit = typeof metadata.credit === "string" ? metadata.credit.trim() : "";
  const license = typeof metadata.license === "string" ? metadata.license.trim() : "";
  const sourceUrl = typeof metadata.sourceUrl === "string" ? metadata.sourceUrl.trim() : "";
  if (!alt || alt.length > 300) throw new CmsError(422, "invalid_media_alt", "Validation Failed", "Alternative text is required and must be at most 300 characters.");
  if (!credit || credit.length > 300) throw new CmsError(422, "invalid_media_credit", "Validation Failed", "Image credit is required and must be at most 300 characters.");
  if (!license || license.length > 160) throw new CmsError(422, "invalid_media_license", "Validation Failed", "A license or rights statement is required and must be at most 160 characters.");
  if (sourceUrl) {
    try { if (new URL(sourceUrl).protocol !== "https:") throw new Error(); }
    catch { throw new CmsError(422, "invalid_media_source", "Validation Failed", "The source URL must use HTTPS."); }
  }
  return { alt, credit, license, ...(sourceUrl ? { sourceUrl } : {}) };
}

export async function onRequestPost(context) {
  const db = requireDatabase(context.env);
  let submissionId = null;
  try {
    const contentId = requireContentId(context.params.contentId);
    const locale = requireLocale(new URL(context.request.url).searchParams.get("locale"));
    const revision = expectedRevision(context.request.headers.get("if-match"));
    const form = await context.request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function" || typeof file.size !== "number") {
      throw new CmsError(400, "media_file_required", "Bad Request", "A single image file is required.");
    }
    const extension = MIME_EXTENSIONS[file.type];
    if (!extension) throw new CmsError(415, "unsupported_media_type", "Unsupported Media Type", "Only JPEG, PNG, WebP and AVIF images are supported.");
    if (file.size < 1 || file.size > MAX_BYTES) throw new CmsError(413, "media_too_large", "Payload Too Large", "The image must be smaller than 8 MiB.");
    const metadata = parseMetadata(await form.get("metadata")?.text?.() || form.get("metadata"));
    const variant = await getVariant(db, contentId, locale);
    if (!variant) throw new CmsError(404, "not_found", "Not Found", "The requested content variant does not exist.");
    if (Number(variant.revision) !== revision) throw new CmsError(409, "revision_conflict", "Conflict", "This content has changed since it was loaded. Reload it before uploading media.");
    const open = await db.prepare("SELECT COUNT(*) AS total FROM cms_submissions WHERE content_id = ? AND locale = ? AND pr_state IN ('pending', 'open')")
      .bind(contentId, locale).first();
    if (Number(open?.total || 0) > 0) throw new CmsError(409, "submission_open", "Conflict", "This variant already has an open review pull request.");

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== file.size || !matchesImageSignature(bytes, file.type)) {
      throw new CmsError(415, "invalid_image_signature", "Unsupported Media Type", "The uploaded bytes do not match the declared image format.");
    }

    const now = new Date().toISOString();
    submissionId = crypto.randomUUID();
    const branchName = "cms/" + contentId + "/" + locale + "/media-r" + revision + "-" + submissionId.slice(0, 8);
    const fileName = crypto.randomUUID() + "." + extension;
    const path = "public/media/" + contentId + "/" + locale + "/" + fileName;
    const src = "/media/" + contentId + "/" + locale + "/" + fileName;
    const media = { src, ...metadata };

    await db.prepare(
      "INSERT INTO cms_submissions (submission_id, content_id, locale, revision, intent, branch, snapshot_json, pr_state, created_at, updated_at) VALUES (?, ?, ?, ?, 'media', ?, ?, 'pending', ?, ?)"
    ).bind(submissionId, contentId, locale, revision, branchName, JSON.stringify({ media }), now, now).run();

    const token = await getInstallationToken(context.env);
    const baseSha = await getMainCommit(token, REPOSITORY);
    await createBranch(token, REPOSITORY, branchName, baseSha);
    await writeRepositoryBinaryFile(token, REPOSITORY, path, branchName, bytes, "cms: add licensed article media");

    const pr = await createRepositoryPullRequest(token, REPOSITORY, {
      title: "[CMS] Add article media: " + variant.title + " (" + locale + ")",
      head: branchName,
      body: [
        "## CMS media submission",
        "",
        "- Content ID: `" + contentId + "`",
        "- Locale: `" + locale + "`",
        "- D1 revision: `" + revision + "`",
        "- Asset: `" + path + "`",
        "- Credit: " + metadata.credit,
        "- License: " + metadata.license,
        "- Alternative text: " + metadata.alt,
        metadata.sourceUrl ? "- Source: " + metadata.sourceUrl : "",
        "",
        "This PR adds the image asset only. The D1 media record is attached after this PR is merged. Article publication requires a separate reviewed CMS PR."
      ].filter(Boolean).join("\n")
    });

    await db.prepare("UPDATE cms_submissions SET pr_number = ?, pr_url = ?, pr_state = 'open', updated_at = ? WHERE submission_id = ?")
      .bind(pr.number, pr.html_url, new Date().toISOString(), submissionId).run();

    return withApiSecurityHeaders(jsonResponse({
      src,
      metadata,
      pullRequest: { number: pr.number, url: pr.html_url, state: pr.state || "open" },
      revision: String(revision)
    }, 201, { ETag: '"' + revision + '"' }));
  } catch (error) {
    if (submissionId) {
      try {
        await db.prepare("UPDATE cms_submissions SET pr_state = 'failed', updated_at = ? WHERE submission_id = ? AND pr_state = 'pending'")
          .bind(new Date().toISOString(), submissionId).run();
      } catch {}
    }
    if (error instanceof CmsError) return withApiSecurityHeaders(problemResponse(error));
    if (error?.code === "github_app_not_configured") {
      return withApiSecurityHeaders(problemResponse(new CmsError(503, "github_app_not_configured", "Service Unavailable", "Configure the GitHub App before uploading media.")));
    }
    return withApiSecurityHeaders(problemResponse(new CmsError(502, "github_media_upload_failed", "Bad Gateway", "The media pull request could not be created. No public asset was changed.")));
  }
}
