import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "dff021f8489d2c316a14575c76de16d4";
const DATABASE_ID = process.env.CMS_D1_DATABASE_ID || "8b6f6c98-06fe-49eb-adbc-690d4b57c058";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ROOT = join(process.cwd(), "src/content/zh-tw/books");
if (!API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN is required.");

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error("Book Markdown is missing frontmatter.");
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!field) continue;
    let value = field[2].trim();
    if (value.startsWith('"')) value = JSON.parse(value);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    fields[field[1]] = value;
  }
  return { fields, body: source.slice(match[0].length).trim() };
}

function stableId(contentId, order) {
  const hex = createHash("sha256").update(contentId + ":section:" + order).digest("hex").slice(0, 32);
  return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
}

function sectionType(title) {
  if (/目錄|目录/.test(title)) return "contents";
  if (/序|序言|前言|編者的話|編者按/.test(title)) return "preface";
  if (/附錄|附录|後記|后记/.test(title)) return "appendix";
  if (/第.{1,8}章|篇第.{1,8}/.test(title)) return "chapter";
  return "other";
}

function splitSections(body) {
  const matches = [...body.matchAll(/^##\s+(.+)\s*$/gm)];
  const sections = [];
  if (!matches.length) return [{ title: "全文", body, type: "other" }];
  const preface = body.slice(0, matches[0].index).trim();
  if (preface) sections.push({ title: "原書說明", body: preface, type: "preface" });
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const title = matches[i][1].trim();
    const sectionBody = body.slice(start, end).trim();
    if (sectionBody) sections.push({ title, body: sectionBody, type: sectionType(title) });
  }
  return sections;
}

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && extname(entry.name) === ".md").map((entry) => join(dir, entry.name));
}

async function query(sql, params = []) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
    method: "POST",
    headers: { Authorization: "Bearer " + API_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success || payload.result?.[0]?.success === false) {
    throw new Error("D1 book import failed: " + JSON.stringify(payload?.errors || payload?.result?.[0]?.error || payload));
  }
  return payload.result?.[0];
}

const expected = new Map([
  ["dao-de-jing-qian-yi", "a3b789f6-4903-4b5a-95ea-f7cb2a9ac03d"],
  ["lun-yu-qian-yi", "54e4b3e8-3f9c-4ac5-a756-3ac84b4fee6c"],
  ["da-xue-qian-yi", "5c48f1a1-6578-46b2-9ffb-961a30afd2e8"],
  ["zhong-yong-qian-yi", "602d60d3-f59e-44e7-9ca7-d783cc66a1fb"],
  ["chu-xiu-dao-gan-yan", "6681b124-5679-46fa-bfa1-d2190f69eeaf"]
]);

const imported = [];
for (const file of await markdownFiles(ROOT)) {
  const slug = basename(file, ".md");
  const expectedId = expected.get(slug);
  if (!expectedId) throw new Error("Unexpected book slug: " + slug);
  const source = await readFile(file, "utf8");
  const { fields, body } = parseFrontmatter(source);
  if (fields.locale !== "zh-TW" || fields.contentId !== expectedId || fields.status !== "published") {
    throw new Error("Book identity/locale/status mismatch in " + file);
  }
  if (!body || body.length < 1000) throw new Error("Book body is unexpectedly short: " + slug);
  const sections = splitSections(body);
  if (!sections.length) throw new Error("No readable sections found: " + slug);

  for (let order = 0; order < sections.length; order++) {
    const section = sections[order];
    await query(
      "INSERT OR REPLACE INTO book_sections (section_id, book_id, section_order, section_type, title, body_markdown, source_page_start, source_page_end) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)",
      [stableId(expectedId, order), expectedId, order, section.type, section.title.slice(0, 300), section.body]
    );
  }
  await query(
    "DELETE FROM book_sections WHERE book_id = ? AND section_order >= ?",
    [expectedId, sections.length]
  );
  await query(
    "UPDATE book_catalog SET content_status = 'text_imported', updated_at = ? WHERE book_id = ?",
    [new Date().toISOString(), expectedId]
  );
  const verification = await query(
    "SELECT COUNT(*) AS sections, SUM(length(body_markdown)) AS text_characters FROM book_sections WHERE book_id = ?",
    [expectedId]
  );
  const row = verification?.results?.[0];
  if (!row || Number(row.sections) !== sections.length || Number(row.text_characters) < 1000) {
    throw new Error("D1 verification failed for " + slug + ": " + JSON.stringify(row));
  }
  imported.push({ slug, sections: Number(row.sections), textCharacters: Number(row.text_characters) });
}

if (imported.length !== expected.size) throw new Error("Expected five books, imported " + imported.length);
console.log(JSON.stringify({ importedBooks: imported.length, books: imported }, null, 2));
