import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const LOCALES = new Set(["en", "zh-CN", "es"]);
const COLLECTIONS = new Set(["lessons", "culture", "festivals", "books", "events"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseScalar(value, lineNumber) {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); }
    catch { throw new Error("Invalid quoted YAML scalar at frontmatter line " + lineNumber); }
  }
  if (raw.startsWith("'")) {
    if (!raw.endsWith("'")) throw new Error("Unclosed YAML string at frontmatter line " + lineNumber);
    return raw.slice(1, -1).replaceAll("''", "'");
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null" || raw === "~") return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw)) return Number(raw);
  if (raw.startsWith("[") || raw.startsWith("{") || raw.startsWith("|") || raw.startsWith(">")) {
    throw new Error("Unsupported structured YAML frontmatter at line " + lineNumber + "; keep CMS contract fields as scalar values or add an explicit parser.");
  }
  return raw.replace(/\s+#.*$/, "").trim();
}

export function parseFrontmatter(source, filePath = "<memory>") {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error("Missing YAML frontmatter: " + filePath);
  const metadata = {};
  const seen = new Set();
  for (const [index, line] of match[1].split(/\r?\n/).entries()) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const field = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!field) throw new Error("Unsupported YAML frontmatter syntax at " + filePath + ":" + (index + 2));
    const [, key, value] = field;
    if (seen.has(key)) throw new Error("Duplicate frontmatter key '" + key + "' in " + filePath);
    seen.add(key);
    metadata[key] = parseScalar(value, index + 2);
  }
  return { metadata, bodyMarkdown: source.slice(match[0].length).trim() };
}

function requireNonEmptyString(value, field, filePath) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Required non-empty '" + field + "' is missing in " + filePath);
  }
}

export function validateVariant({ metadata, bodyMarkdown, filePath, localeFromPath, collection, slug }) {
  const id = metadata.contentId;
  if (typeof id !== "string" || !UUID.test(id)) throw new Error("Invalid immutable contentId in " + filePath);
  if (!LOCALES.has(metadata.locale)) throw new Error("Unsupported locale in " + filePath + ": " + metadata.locale);
  if (metadata.locale !== localeFromPath) throw new Error("Locale metadata does not match its directory in " + filePath);
  if (!COLLECTIONS.has(collection)) throw new Error("Unsupported content collection in " + filePath);
  if (!SLUG.test(slug)) throw new Error("Invalid route slug in " + filePath);
  if (metadata.slug !== undefined && metadata.slug !== slug) throw new Error("Frontmatter slug must match the existing filename in " + filePath);

  for (const field of ["title", "description", "category"]) requireNonEmptyString(metadata[field], field, filePath);
  if (typeof bodyMarkdown !== "string" || !bodyMarkdown.trim()) throw new Error("Article body is empty in " + filePath);

  // Existing public Markdown predates CMS status/timestamps. Preserve its established
  // published-by-default behavior; all new CMS snapshots write these fields explicitly.
  const status = metadata.status ?? "published";
  if (!["draft", "published", "unpublished"].includes(status)) throw new Error("Invalid status in " + filePath);
  if (metadata.featured !== undefined && typeof metadata.featured !== "boolean") throw new Error("featured must be a boolean in " + filePath);
  if (status === "published" && metadata.publishedAt !== undefined && !Number.isFinite(Date.parse(metadata.publishedAt))) {
    throw new Error("publishedAt must be an ISO-8601 date-time in " + filePath);
  }
  if (metadata.updatedAt !== undefined && !Number.isFinite(Date.parse(metadata.updatedAt))) {
    throw new Error("updatedAt must be an ISO-8601 date-time in " + filePath);
  }
  if (metadata.seoTitle !== undefined) requireNonEmptyString(metadata.seoTitle, "seoTitle", filePath);
  if (metadata.seoDescription !== undefined) requireNonEmptyString(metadata.seoDescription, "seoDescription", filePath);
  if (metadata.readingMinutes !== undefined && (!Number.isInteger(metadata.readingMinutes) || metadata.readingMinutes < 1)) {
    throw new Error("readingMinutes must be a positive integer in " + filePath);
  }
  if (metadata.order !== undefined && (typeof metadata.order !== "number" || metadata.order < 0)) {
    throw new Error("order must be a non-negative number in " + filePath);
  }

  const legacyImage = metadata.imageUrl ?? metadata.image;
  if (legacyImage !== undefined && legacyImage !== null) {
    let url;
    try { url = new URL(legacyImage); } catch { throw new Error("Legacy image must be an absolute URL in " + filePath); }
    if (url.protocol !== "https:") throw new Error("Legacy image URL must use HTTPS in " + filePath);
    requireNonEmptyString(metadata.imageAlt, "imageAlt", filePath);
  }

  if (metadata.sources !== undefined && !Array.isArray(metadata.sources)) throw new Error("sources must be an array in " + filePath);
  if (metadata.media !== undefined && !Array.isArray(metadata.media)) throw new Error("media must be an array in " + filePath);
  if (metadata.tags !== undefined && (!Array.isArray(metadata.tags) || metadata.tags.some((tag) => typeof tag !== "string"))) {
    throw new Error("tags must be an array of strings in " + filePath);
  }
  if (metadata.locale === "zh-CN" && !/[\u3400-\u9fff]/u.test(metadata.title + bodyMarkdown)) {
    throw new Error("zh-CN content must contain Simplified Chinese text in " + filePath);
  }

  return { contentId: id.toLowerCase(), locale: metadata.locale, collection, slug, status };
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

export async function validateContentTree(root = process.cwd()) {
  const contentRoot = join(root, "src", "content");
  const files = await markdownFiles(contentRoot);
  if (!files.length) throw new Error("No Markdown content files were found.");

  const byIdentity = new Map();
  const routeKeys = new Set();
  const counts = { en: 0, "zh-CN": 0, es: 0 };
  for (const filePath of files) {
    const rel = relative(contentRoot, filePath).replaceAll("\\", "/").split("/");
    const locale = rel[0] === "zh-cn" ? "zh-CN" : rel[0] === "es" ? "es" : "en";
    const collection = locale === "en" ? rel[0] : rel[1];
    if (rel.length !== 2 && rel.length !== 3) throw new Error("Unexpected content path depth: " + filePath);
    const slug = rel.at(-1).replace(/\.md$/i, "");
    const source = await readFile(filePath, "utf8");
    const parsed = parseFrontmatter(source, filePath);
    const variant = validateVariant({ ...parsed, filePath, localeFromPath: locale, collection, slug });
    const identityKey = variant.contentId + ":" + variant.locale;
    if (byIdentity.has(identityKey)) throw new Error("Duplicate contentId/locale pair: " + identityKey);
    const routeKey = variant.locale + ":" + variant.collection + ":" + variant.slug;
    if (routeKeys.has(routeKey)) throw new Error("Duplicate locale/collection/slug route: " + routeKey);
    routeKeys.add(routeKey);
    byIdentity.set(identityKey, variant);
    counts[variant.locale] += 1;
  }

  const concepts = new Map();
  for (const variant of byIdentity.values()) {
    const existing = concepts.get(variant.contentId) ?? new Map();
    if (existing.has(variant.locale)) throw new Error("Duplicate translation locale for " + variant.contentId);
    if (existing.size && [...existing.values()][0].collection !== variant.collection) {
      throw new Error("Translated variants must stay in the same collection: " + variant.contentId);
    }
    existing.set(variant.locale, variant);
    concepts.set(variant.contentId, existing);
  }

  const incomplete = [];
  for (const [contentId, variants] of concepts) {
    const missing = [...LOCALES].filter((locale) => !variants.has(locale));
    if (missing.length) incomplete.push({ contentId, missingLocales: missing });
  }
  return { files: files.length, concepts: concepts.size, localeCounts: counts, incompleteTranslations: incomplete };
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  const result = await validateContentTree();
  console.log(JSON.stringify({ ...result, result: "PASS" }, null, 2));
}
