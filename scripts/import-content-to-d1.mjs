import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, basename, extname } from "node:path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "dff021f8489d2c316a14575c76de16d4";
const DATABASE_ID = process.env.CMS_D1_DATABASE_ID || "8b6f6c98-06fe-49eb-adbc-690d4b57c058";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const SOURCE_COMMIT = process.env.CMS_SOURCE_COMMIT || process.env.GITHUB_SHA;
const ROOT = process.cwd();
const IMPORTED_AT = new Date().toISOString();
const LOCALE_ROOTS = [
  { root: "src/content", locale: "en" },
  { root: "src/content/zh-cn", locale: "zh-CN" },
  { root: "src/content/es", locale: "es" }
];
const COLLECTIONS = new Set(["lessons", "culture", "festivals", "books", "events"]);

if (!API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN is required.");
if (!SOURCE_COMMIT || !/^[0-9a-f]{40}$/i.test(SOURCE_COMMIT)) {
  throw new Error("CMS_SOURCE_COMMIT (or GITHUB_SHA) must be a full 40-character Git commit SHA.");
}

function deterministicUuid(value) {
  const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function scalar(value) {
  const text = value.trim();
  if (!text) return "";
  if (text.startsWith('"')) return JSON.parse(text);
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1,-1).replaceAll("''", "'");
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  return text;
}

function parseMarkdown(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error("Markdown file is missing YAML frontmatter.");
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const field = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!field) throw new Error("Unsupported frontmatter syntax: " + line);
    metadata[field[1]] = scalar(field[2]);
  }
  return { metadata, bodyMarkdown: source.slice(match[0].length).replace(/^\n+|\n+$/g, "") + "\n" };
}

async function markdownFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await markdownFiles(path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") output.push(path);
  }
  return output;
}

function asText(value) {
  return value === undefined || value === null ? "" : String(value);
}

function buildVariant(filePath, localeRoot) {
  const rel = relative(localeRoot.root, filePath).replaceAll("\\", "/");
  const [collection, ...rest] = rel.split("/");
  if (!COLLECTIONS.has(collection) || rest.length !== 1) return null;
  return readFile(filePath, "utf8").then((source) => {
    const { metadata, bodyMarkdown } = parseMarkdown(source);
    const slug = basename(filePath, ".md");
    const contentId = deterministicUuid(collection + "/" + slug);
    const status = metadata.status || "published";
    if (!["draft", "published", "unpublished"].includes(status)) throw new Error("Invalid status in " + filePath);
    const publishedAt = status === "published" ? asText(metadata.publishedAt || IMPORTED_AT) : "";
    const updatedAt = asText(metadata.updatedAt || IMPORTED_AT);
    const imageUrl = asText(metadata.image);
    if (imageUrl && !imageUrl.startsWith("https://")) throw new Error("Legacy image URL must use HTTPS: " + filePath);
    return {
      contentId, locale: localeRoot.locale, collection, slug,
      title: asText(metadata.title), description: asText(metadata.description),
      category: asText(metadata.category), bodyMarkdown, status,
      featured: metadata.featured === true ? 1 : 0,
      updatedAt, publishedAt,
      displayOrder: metadata.order === undefined ? "" : asText(metadata.order),
      readingMinutes: asText(metadata.readingMinutes || 5),
      level: asText(metadata.level), chinese: asText(metadata.chinese), pinyin: asText(metadata.pinyin),
      tagsJson: "[]", sourcesJson: "[]", mediaJson: "[]",
      imageUrl, imageAlt: asText(metadata.imageAlt),
      sourcePath: filePath.replaceAll("\\", "/"),
      sourceCommit: SOURCE_COMMIT
    };
  });
}

function query(sql, params = []) {
  return { sql, params: params.map(asText) };
}

async function executeStatement(statement) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + API_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(statement)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error("Cloudflare D1 import request failed: " + JSON.stringify(payload?.errors || payload || { status: response.status }));
  }
  const result = payload.result?.[0];
  if (result?.success === false) throw new Error("A D1 import statement failed: " + JSON.stringify(result));
  return result;
}

const variants = [];
for (const localeRoot of LOCALE_ROOTS) {
  const files = await markdownFiles(join(ROOT, localeRoot.root));
  for (const filePath of files) {
    const variant = await buildVariant(filePath, localeRoot);
    if (variant) variants.push(variant);
  }
}

const byContent = new Map();
for (const variant of variants) {
  const existing = byContent.get(variant.contentId);
  if (existing && existing.collection !== variant.collection) throw new Error("Content ID collection mismatch.");
  if (!byContent.has(variant.contentId)) byContent.set(variant.contentId, []);
  byContent.get(variant.contentId).push(variant);
}

if (!variants.length) throw new Error("No supported Markdown articles found.");
for (const locale of ["en", "zh-CN", "es"]) {
  const count = variants.filter((variant) => variant.locale === locale).length;
  if (count !== 13) throw new Error("Expected 13 existing " + locale + " articles, found " + count + ". Refusing an incomplete initial import.");
}
for (const variant of variants) {
  if (!variant.title || !variant.description || !variant.category || !variant.bodyMarkdown.trim()) {
    throw new Error("Required article content is missing in " + variant.sourcePath);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.slug)) throw new Error("Invalid slug in " + variant.sourcePath);
}
for (const [contentId, records] of byContent) {
  const locales = new Set(records.map((record) => record.locale));
  if (locales.size !== records.length) throw new Error("Duplicate locale variant for " + contentId);
  const statements = [
    query(
      "INSERT OR IGNORE INTO content_items (content_id, collection, created_at, source_commit) VALUES (?, ?, ?, ?)",
      [contentId, records[0].collection, IMPORTED_AT, SOURCE_COMMIT]
    )
  ];
  for (const record of records) {
    const snapshot = {
      contentId: record.contentId, locale: record.locale, collection: record.collection,
      slug: record.slug, title: record.title, description: record.description,
      category: record.category, status: record.status, featured: Boolean(record.featured),
      updatedAt: record.updatedAt, publishedAt: record.publishedAt || undefined,
      readingMinutes: Number(record.readingMinutes), bodyMarkdown: record.bodyMarkdown,
      tags: [], sources: [], media: [], imageUrl: record.imageUrl || undefined,
      imageAlt: record.imageAlt || undefined,
      order: record.displayOrder === "" ? undefined : Number(record.displayOrder),
      level: record.level || undefined, chinese: record.chinese || undefined, pinyin: record.pinyin || undefined,
      revision: "1"
    };
    statements.push(query(
      "INSERT OR IGNORE INTO content_variants (content_id, locale, collection, slug, title, description, seo_title, seo_description, category, body_markdown, status, featured, updated_at, published_at, display_order, reading_minutes, level, chinese, pinyin, tags_json, sources_json, media_json, image_url, image_alt, source_path, revision, last_mutation_id) VALUES (?, ?, ?, ?, ?, ?, '', '', ?, ?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
      [
        record.contentId, record.locale, record.collection, record.slug, record.title, record.description,
        record.category, record.bodyMarkdown, record.status, record.featured, record.updatedAt,
        record.publishedAt, record.displayOrder, record.readingMinutes, record.level, record.chinese,
        record.pinyin, record.tagsJson, record.sourcesJson, record.mediaJson, record.imageUrl,
        record.imageAlt, record.sourcePath, "legacy-import:" + SOURCE_COMMIT + ":" + record.locale
      ]
    ));
    statements.push(query(
      "INSERT OR IGNORE INTO content_revisions (revision_id, content_id, locale, revision, actor_email, snapshot_json, created_at) VALUES (?, ?, ?, 1, ?, ?, ?)",
      [record.contentId + ":" + record.locale + ":1", record.contentId, record.locale, "migration@system.local", JSON.stringify(snapshot), IMPORTED_AT]
    ));
  }
  for (const statement of statements) await executeStatement(statement);
}

const verify = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
  method: "POST",
  headers: { Authorization: "Bearer " + API_TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "SELECT locale, status, COUNT(*) AS total FROM content_variants GROUP BY locale, status ORDER BY locale, status" })
});
const verifyPayload = await verify.json();
if (!verify.ok || !verifyPayload?.success) throw new Error("D1 verification query failed.");
const counts = verifyPayload.result?.[0]?.results || [];
console.log(JSON.stringify({
  importedMarkdownFiles: variants.length,
  conceptualItems: byContent.size,
  sourceCommit: SOURCE_COMMIT,
  localeStatusCounts: counts
}, null, 2));
