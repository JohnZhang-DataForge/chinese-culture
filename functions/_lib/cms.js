import { RequestValidationError, readJsonBody } from "./http.js";

const COLLECTIONS = new Set(["lessons", "culture", "festivals", "books", "events"]);
const LOCALES = new Set(["en", "zh-CN", "es"]);
const STATUSES = new Set(["draft", "published", "unpublished"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WRITE_FIELDS = new Set([
  "locale", "collection", "slug", "title", "description", "seoTitle",
  "seoDescription", "category", "featured", "publishedAt", "order",
  "readingMinutes", "level", "chinese", "pinyin", "sources", "media",
  "tags", "bodyMarkdown", "imageUrl", "imageAlt"
]);

export class CmsError extends Error {
  constructor(status, code, title, detail, errors) {
    super(detail || title);
    this.name = "CmsError";
    this.status = status;
    this.code = code;
    this.title = title;
    this.errors = errors;
  }
}

export function problemResponse(error, requestId = crypto.randomUUID()) {
  const known = error instanceof CmsError;
  const validation = error instanceof RequestValidationError;
  const status = known ? error.status : validation ? error.status : 500;
  const code = known ? error.code : validation ? "invalid_request" : "internal_error";
  const title = known ? error.title : validation ? "Invalid request" : "Internal Server Error";
  const detail = known || validation ? error.message : "The request could not be completed.";
  const body = { type: "about:blank", title, status, detail, code, requestId };
  if (known && Array.isArray(error.errors) && error.errors.length) body.errors = error.errors;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/problem+json; charset=utf-8", "cache-control": "no-store" }
  });
}

export function requireDatabase(env) {
  if (!env || !env.CMS_DB || typeof env.CMS_DB.prepare !== "function") {
    throw new CmsError(503, "database_unavailable", "Service Unavailable", "The CMS database binding is not available.");
  }
  return env.CMS_DB;
}

export function requireContentId(value) {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    throw new CmsError(400, "invalid_content_id", "Bad Request", "contentId must be a valid UUID.");
  }
  return value.toLowerCase();
}

export function requireLocale(value) {
  if (!LOCALES.has(value)) {
    throw new CmsError(400, "invalid_locale", "Bad Request", "locale must be en, zh-CN or es.");
  }
  return value;
}

export async function readContentBody(request) {
  return readJsonBody(request, 1024 * 1024);
}

function parseJson(value, fallback = []) {
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function toVariant(row, includeBody = true) {
  if (!row) return null;
  const locales = typeof row.translation_locales === "string" && row.translation_locales
    ? row.translation_locales.split(",")
    : [row.locale];

  const result = {
    contentId: row.content_id,
    locale: row.locale,
    collection: row.collection,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    featured: Boolean(row.featured),
    updatedAt: row.updated_at,
    revision: String(row.revision),
    translationLocales: locales,
    readingMinutes: Number(row.reading_minutes || 5),
    pullRequest: row.pull_request === null || row.pull_request === undefined ? null : Number(row.pull_request)
  };

  if (row.branch) result.branch = row.branch;
  if (row.pull_request_state) result.pullRequestState = row.pull_request_state;
  if (row.pending_media_json) result.pendingMedia = parseJson(row.pending_media_json);
  if (includeBody) {
    result.bodyMarkdown = row.body_markdown || "";
    result.sources = parseJson(row.sources_json);
    result.media = parseJson(row.media_json);
  }
  if (row.image_url) result.imageUrl = row.image_url;
  if (row.image_alt) result.imageAlt = row.image_alt;
  if (row.seo_title) result.seoTitle = row.seo_title;
  if (row.seo_description) result.seoDescription = row.seo_description;
  if (row.published_at) result.publishedAt = row.published_at;
  if (row.display_order !== null && row.display_order !== undefined) result.order = Number(row.display_order);
  if (row.level) result.level = row.level;
  if (row.chinese) result.chinese = row.chinese;
  if (row.pinyin) result.pinyin = row.pinyin;
  result.tags = parseJson(row.tags_json);
  return result;
}

const VARIANT_SELECT = [
  "SELECT v.*,",
  "(SELECT group_concat(locale, ',') FROM (SELECT locale FROM content_variants WHERE content_id = v.content_id ORDER BY locale)) AS translation_locales,",
  "(SELECT branch FROM cms_submissions s WHERE s.content_id = v.content_id AND s.locale = v.locale ORDER BY s.created_at DESC, s.submission_id DESC LIMIT 1) AS branch,",
  "(SELECT pr_number FROM cms_submissions s WHERE s.content_id = v.content_id AND s.locale = v.locale ORDER BY s.created_at DESC, s.submission_id DESC LIMIT 1) AS pull_request,",
  "(SELECT pr_state FROM cms_submissions s WHERE s.content_id = v.content_id AND s.locale = v.locale ORDER BY s.created_at DESC, s.submission_id DESC LIMIT 1) AS pull_request_state,",
  "(SELECT snapshot_json FROM cms_submissions s WHERE s.content_id = v.content_id AND s.locale = v.locale AND s.intent = 'media' AND s.pr_state IN ('pending', 'open') ORDER BY s.created_at DESC, s.submission_id DESC LIMIT 1) AS pending_media_json",
  "FROM content_variants v"
].join(" ");

export async function getVariant(db, contentId, locale) {
  const row = await db.prepare(VARIANT_SELECT + " WHERE v.content_id = ? AND v.locale = ?")
    .bind(contentId, locale).first();
  return toVariant(row, true);
}

function validateSource(source, index) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Each source must be an object.", [{ field: "sources[" + index + "]", message: "Expected an object." }]);
  }
  if (typeof source.title !== "string" || !source.title.trim() || source.title.length > 180) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Source title is required.", [{ field: "sources[" + index + "].title", message: "Required, maximum 180 characters." }]);
  }
  let url;
  try { url = new URL(source.url); } catch { url = null; }
  if (!url || url.protocol !== "https:") {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Source URL must use HTTPS.", [{ field: "sources[" + index + "].url", message: "A valid HTTPS URL is required." }]);
  }
  const result = { title: source.title.trim(), url: url.toString() };
  if (source.publisher !== undefined) {
    if (typeof source.publisher !== "string" || source.publisher.length > 180) throw new CmsError(422, "validation_failed", "Validation Failed", "Invalid source publisher.");
    result.publisher = source.publisher.trim();
  }
  if (source.accessedAt !== undefined) {
    if (typeof source.accessedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt) || Number.isNaN(Date.parse(source.accessedAt))) {
      throw new CmsError(422, "validation_failed", "Validation Failed", "Invalid source accessedAt date.");
    }
    result.accessedAt = source.accessedAt;
  }
  return result;
}

function validateMedia(media, index) {
  if (!media || typeof media !== "object" || Array.isArray(media)) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Each media item must be an object.", [{ field: "media[" + index + "]", message: "Expected an object." }]);
  }
  const decorative = media.decorative === true;
  if (typeof media.src !== "string" || !media.src.startsWith("/media/") || media.src.includes("..") || media.src.includes("\\") || media.src.length > 500) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Media src must be a safe /media/ path.");
  }
  if (typeof media.alt !== "string" || (!decorative && !media.alt.trim()) || media.alt.length > 300) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Media alt text is required unless decorative is true.");
  }
  if (typeof media.credit !== "string" || !media.credit.trim() || media.credit.length > 300) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Media credit is required.");
  }
  if (typeof media.license !== "string" || !media.license.trim() || media.license.length > 160) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "Media license is required.");
  }
  const result = { src: media.src, alt: media.alt.trim(), decorative, credit: media.credit.trim(), license: media.license.trim() };
  if (media.sourceUrl !== undefined) {
    let url;
    try { url = new URL(media.sourceUrl); } catch { url = null; }
    if (!url || url.protocol !== "https:") throw new CmsError(422, "validation_failed", "Validation Failed", "Media sourceUrl must use HTTPS.");
    result.sourceUrl = url.toString();
  }
  return result;
}

export function validateContentWrite(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CmsError(400, "invalid_body", "Bad Request", "A JSON object is required.");
  }
  const unknown = Object.keys(input).filter((key) => !WRITE_FIELDS.has(key));
  if (unknown.length) {
    throw new CmsError(422, "validation_failed", "Validation Failed", "The request contains unsupported fields.", unknown.map((field) => ({ field, message: "Unsupported field." })));
  }

  const errors = [];
  const requiredString = (field, max) => {
    const value = input[field];
    if (typeof value !== "string" || !value.trim() || value.length > max) {
      errors.push({ field, message: "Required non-empty string, maximum " + max + " characters." });
      return "";
    }
    return value.trim();
  };

  const locale = requireLocale(input.locale);
  const collection = input.collection;
  if (!COLLECTIONS.has(collection)) errors.push({ field: "collection", message: "Unsupported collection." });
  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  if (!SLUG_RE.test(slug) || slug.length > 120) errors.push({ field: "slug", message: "Use a lowercase kebab-case slug." });

  const title = requiredString("title", 180);
  const description = requiredString("description", 500);
  const category = requiredString("category", 100);
  const bodyMarkdown = typeof input.bodyMarkdown === "string" ? input.bodyMarkdown : "";
  if (typeof input.bodyMarkdown !== "string") errors.push({ field: "bodyMarkdown", message: "Required Markdown body string." });
  else if (bodyMarkdown.length > 200000) errors.push({ field: "bodyMarkdown", message: "Maximum 200000 characters." });
  if (typeof input.featured !== "boolean") errors.push({ field: "featured", message: "Must be a boolean." });

  const optionalText = (field, max) => {
    if (input[field] === undefined) return undefined;
    if (typeof input[field] !== "string" || !input[field].trim() || input[field].length > max) {
      errors.push({ field, message: "Must be a non-empty string of at most " + max + " characters." });
      return undefined;
    }
    return input[field].trim();
  };

  const seoTitle = optionalText("seoTitle", 180);
  let imageUrl;
  if (input.imageUrl !== undefined && input.imageUrl !== "") {
    try { const parsed = new URL(input.imageUrl); if (parsed.protocol !== "https:") throw new Error(); imageUrl = parsed.toString(); }
    catch { errors.push({ field: "imageUrl", message: "Must be a valid HTTPS image URL." }); }
  }
  const imageAlt = input.imageAlt === undefined ? undefined : (typeof input.imageAlt === "string" && input.imageAlt.length <= 300 ? input.imageAlt.trim() : (errors.push({ field: "imageAlt", message: "Must be text of at most 300 characters." }), undefined));
  const seoDescription = optionalText("seoDescription", 300);
  const level = optionalText("level", 80);
  const chinese = optionalText("chinese", 120);
  const pinyin = optionalText("pinyin", 120);

  let order;
  if (input.order !== undefined) {
    if (typeof input.order !== "number" || !Number.isFinite(input.order) || input.order < 0) errors.push({ field: "order", message: "Must be a non-negative number." });
    else order = input.order;
  }

  let readingMinutes = 5;
  if (input.readingMinutes !== undefined) {
    if (!Number.isInteger(input.readingMinutes) || input.readingMinutes < 1 || input.readingMinutes > 240) errors.push({ field: "readingMinutes", message: "Must be an integer from 1 to 240." });
    else readingMinutes = input.readingMinutes;
  }

  let publishedAt;
  if (input.publishedAt !== undefined) {
    if (typeof input.publishedAt !== "string" || Number.isNaN(Date.parse(input.publishedAt)) || !/[Tt]/.test(input.publishedAt)) errors.push({ field: "publishedAt", message: "Must be an ISO 8601 date-time." });
    else publishedAt = new Date(input.publishedAt).toISOString();
  }

  const tags = input.tags === undefined ? [] : input.tags;
  if (!Array.isArray(tags) || tags.length > 50 || tags.some((tag) => typeof tag !== "string" || !tag.trim() || tag.length > 80)) errors.push({ field: "tags", message: "Must contain at most 50 non-empty strings of at most 80 characters." });
  const sources = input.sources === undefined ? [] : input.sources;
  if (!Array.isArray(sources) || sources.length > 50) errors.push({ field: "sources", message: "Must be an array of at most 50 source records." });
  const media = input.media === undefined ? [] : input.media;
  if (!Array.isArray(media) || media.length > 50) errors.push({ field: "media", message: "Must be an array of at most 50 media records." });

  if (errors.length) throw new CmsError(422, "validation_failed", "Validation Failed", "One or more content fields are invalid.", errors);

  return {
    locale, collection, slug, title, description, seoTitle, seoDescription,
    category, featured: input.featured, publishedAt, order, readingMinutes,
    level, chinese, pinyin, imageUrl, imageAlt,
    sources: sources.map(validateSource),
    media: media.map(validateMedia),
    tags: tags.map((tag) => tag.trim()),
    bodyMarkdown
  };
}

function snapshotFor(contentId, value, status, updatedAt, revision, publishedAt) {
  const snapshot = {
    contentId, locale: value.locale, collection: value.collection, slug: value.slug,
    title: value.title, description: value.description, category: value.category,
    status, featured: value.featured, updatedAt, revision: String(revision),
    readingMinutes: value.readingMinutes, bodyMarkdown: value.bodyMarkdown,
    tags: value.tags, sources: value.sources, media: value.media
  };
  if (value.seoTitle) snapshot.seoTitle = value.seoTitle;
  if (value.seoDescription) snapshot.seoDescription = value.seoDescription;
  if (publishedAt) snapshot.publishedAt = publishedAt;
  if (value.order !== undefined) snapshot.order = value.order;
  if (value.level) snapshot.level = value.level;
  if (value.chinese) snapshot.chinese = value.chinese;
  if (value.pinyin) snapshot.pinyin = value.pinyin;
  if (value.imageUrl) snapshot.imageUrl = value.imageUrl;
  if (value.imageAlt) snapshot.imageAlt = value.imageAlt;
  return snapshot;
}

function variantInsert(db, contentId, value, now, actorEmail) {
  const mutationId = crypto.randomUUID();
  const snapshot = snapshotFor(contentId, value, "draft", now, 1, value.publishedAt);
  return [
    db.prepare("INSERT INTO content_variants (content_id, locale, collection, slug, title, description, seo_title, seo_description, category, body_markdown, status, featured, updated_at, published_at, display_order, reading_minutes, level, chinese, pinyin, tags_json, sources_json, media_json, image_url, image_alt, revision, last_mutation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)")
      .bind(contentId, value.locale, value.collection, value.slug, value.title, value.description, value.seoTitle ?? null, value.seoDescription ?? null, value.category, value.bodyMarkdown, value.featured ? 1 : 0, now, value.publishedAt ?? null, value.order ?? null, value.readingMinutes, value.level ?? null, value.chinese ?? null, value.pinyin ?? null, JSON.stringify(value.tags), JSON.stringify(value.sources), JSON.stringify(value.media), value.imageUrl ?? null, value.imageAlt ?? null, mutationId),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) VALUES (?, ?, ?, 1, ?, ?, ?)")
      .bind(crypto.randomUUID(), contentId, value.locale, actorEmail, JSON.stringify(snapshot), now)
  ];
}

export async function createContent(db, value, actorEmail) {
  const contentId = crypto.randomUUID();
  const now = new Date().toISOString();
  const mutationId = crypto.randomUUID();
  const snapshot = snapshotFor(contentId, value, "draft", now, 1, value.publishedAt);
  await db.batch([
    db.prepare("INSERT INTO content_items (content_id, collection, created_at) VALUES (?, ?, ?)")
      .bind(contentId, value.collection, now),
    db.prepare("INSERT INTO content_variants (content_id, locale, collection, slug, title, description, seo_title, seo_description, category, body_markdown, status, featured, updated_at, published_at, display_order, reading_minutes, level, chinese, pinyin, tags_json, sources_json, media_json, image_url, image_alt, revision, last_mutation_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)")
      .bind(contentId, value.locale, value.collection, value.slug, value.title, value.description, value.seoTitle ?? null, value.seoDescription ?? null, value.category, value.bodyMarkdown, value.featured ? 1 : 0, now, value.publishedAt ?? null, value.order ?? null, value.readingMinutes, value.level ?? null, value.chinese ?? null, value.pinyin ?? null, JSON.stringify(value.tags), JSON.stringify(value.sources), JSON.stringify(value.media), value.imageUrl ?? null, value.imageAlt ?? null, mutationId),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) VALUES (?, ?, ?, 1, ?, ?, ?)")
      .bind(crypto.randomUUID(), contentId, value.locale, actorEmail, JSON.stringify(snapshot), now)
  ]);
  return getVariant(db, contentId, value.locale);
}

export async function createTranslation(db, contentId, value, actorEmail) {
  const item = await db.prepare("SELECT collection FROM content_items WHERE content_id = ?").bind(contentId).first();
  if (!item) throw new CmsError(404, "not_found", "Not Found", "The requested content item does not exist.");
  if (item.collection !== value.collection) throw new CmsError(422, "collection_mismatch", "Validation Failed", "A translation must use the parent content item's collection.");
  const existing = await db.prepare("SELECT 1 AS found FROM content_variants WHERE content_id = ? AND locale = ?").bind(contentId, value.locale).first();
  if (existing) throw new CmsError(409, "translation_exists", "Conflict", "A variant for this locale already exists.");

  const now = new Date().toISOString();
  await db.batch(variantInsert(db, contentId, value, now, actorEmail));
  return getVariant(db, contentId, value.locale);
}

export async function saveDraft(db, contentId, locale, value, expectedRevision, actorEmail) {
  const current = await getVariant(db, contentId, locale);
  if (!current) throw new CmsError(404, "not_found", "Not Found", "The requested locale variant does not exist.");
  if (current.collection !== value.collection) throw new CmsError(422, "collection_immutable", "Validation Failed", "The collection cannot be changed after content creation.");
  if (Number(current.revision) !== expectedRevision) throw new CmsError(409, "revision_conflict", "Conflict", "This content has changed since it was loaded. Reload it before saving.");
  const openSubmission = await db.prepare("SELECT COUNT(*) AS total FROM cms_submissions WHERE content_id = ? AND locale = ? AND pr_state IN ('pending', 'open')").bind(contentId, locale).first();
  if (Number(openSubmission?.total || 0) > 0) throw new CmsError(409, "submission_open", "Conflict", "This variant has an open review pull request. Close or merge it before editing again.");

  const now = new Date().toISOString();
  const revision = expectedRevision + 1;
  const mutationId = crypto.randomUUID();
  const publishedAt = value.publishedAt ?? current.publishedAt ?? null;
  const snapshot = snapshotFor(contentId, value, "draft", now, revision, publishedAt);

  const results = await db.batch([
    db.prepare("UPDATE content_variants SET slug = ?, title = ?, description = ?, seo_title = ?, seo_description = ?, category = ?, body_markdown = ?, status = 'draft', featured = ?, updated_at = ?, published_at = ?, display_order = ?, reading_minutes = ?, level = ?, chinese = ?, pinyin = ?, tags_json = ?, sources_json = ?, media_json = ?, image_url = ?, image_alt = ?, revision = revision + 1, last_mutation_id = ? WHERE content_id = ? AND locale = ? AND revision = ?")
      .bind(value.slug, value.title, value.description, value.seoTitle ?? null, value.seoDescription ?? null, value.category, value.bodyMarkdown, value.featured ? 1 : 0, now, publishedAt, value.order ?? null, value.readingMinutes, value.level ?? null, value.chinese ?? null, value.pinyin ?? null, JSON.stringify(value.tags), JSON.stringify(value.sources), JSON.stringify(value.media), value.imageUrl ?? null, value.imageAlt ?? null, mutationId, contentId, locale, expectedRevision),
    db.prepare("INSERT INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) SELECT ?, content_id, locale, revision, ?, ?, ? FROM content_variants WHERE content_id = ? AND locale = ? AND revision = ? AND last_mutation_id = ?")
      .bind(crypto.randomUUID(), actorEmail, JSON.stringify(snapshot), now, contentId, locale, revision, mutationId)
  ]);

  if (!results[0]?.meta?.changes) throw new CmsError(409, "revision_conflict", "Conflict", "This content has changed since it was loaded. Reload it before saving.");
  if (results[1]?.meta?.changes !== 1) throw new CmsError(500, "revision_write_failed", "Internal Server Error", "The content revision could not be recorded.");
  return getVariant(db, contentId, locale);
}

export async function listContent(db, url) {
  const params = new URL(url).searchParams;
  const page = Number(params.get("page") || 1);
  const pageSize = Number(params.get("pageSize") || 25);
  if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new CmsError(400, "invalid_pagination", "Bad Request", "page must be 1–10000 and pageSize must be 1–100.");
  }

  const filters = [];
  const values = [];
  const locale = params.get("locale");
  const collection = params.get("collection");
  const status = params.get("status");
  const query = (params.get("q") || "").trim().slice(0, 120);

  if (locale) { requireLocale(locale); filters.push("v.locale = ?"); values.push(locale); }
  if (collection) {
    if (!COLLECTIONS.has(collection)) throw new CmsError(400, "invalid_collection", "Bad Request", "Unsupported collection.");
    filters.push("v.collection = ?"); values.push(collection);
  }
  if (status) {
    if (!STATUSES.has(status)) throw new CmsError(400, "invalid_status", "Bad Request", "Unsupported status.");
    filters.push("v.status = ?"); values.push(status);
  }
  if (query) {
    filters.push("(instr(lower(v.title), lower(?)) > 0 OR instr(lower(v.slug), lower(?)) > 0 OR instr(lower(v.content_id), lower(?)) > 0)");
    values.push(query, query, query);
  }

  const where = filters.length ? " WHERE " + filters.join(" AND ") : "";
  const count = await db.prepare("SELECT COUNT(*) AS total FROM content_variants v" + where).bind(...values).first();
  const rows = await db.prepare(VARIANT_SELECT + where + " ORDER BY v.updated_at DESC, v.content_id ASC, v.locale ASC LIMIT ? OFFSET ?")
    .bind(...values, pageSize, (page - 1) * pageSize).all();

  return {
    items: (rows.results || []).map((row) => toVariant(row, false)),
    page,
    pageSize,
    total: Number(count?.total || 0)
  };
}

export async function deleteDraft(db, contentId, locale) {
  const current = await getVariant(db, contentId, locale);
  if (!current) throw new CmsError(404, "not_found", "Not Found", "The requested locale variant does not exist.");
  if (current.status !== "draft") throw new CmsError(409, "not_a_draft", "Conflict", "Only a draft variant can be discarded.");
  const open = await db.prepare("SELECT COUNT(*) AS total FROM cms_submissions WHERE content_id = ? AND locale = ? AND pr_state IN ('pending', 'open')")
    .bind(contentId, locale).first();
  if (Number(open?.total || 0) > 0) throw new CmsError(409, "submission_open", "Conflict", "This draft is linked to a pending or open publication submission.");

  const result = await db.prepare("DELETE FROM content_variants WHERE content_id = ? AND locale = ? AND status = 'draft'")
    .bind(contentId, locale).run();
  if (!result?.meta?.changes) throw new CmsError(409, "revision_conflict", "Conflict", "The draft changed before it could be discarded.");
}
