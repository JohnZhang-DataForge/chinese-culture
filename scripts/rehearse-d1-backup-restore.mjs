import { createHash, createHash as hash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile, appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PRODUCTION_DB_ID = process.env.CMS_D1_DATABASE_ID;
const RUN_ID = process.env.GITHUB_RUN_ID || String(Date.now());
const API_ROOT = "https://api.cloudflare.com/client/v4";
const API_BASE = `/accounts/${ACCOUNT_ID}/d1`;
const TEMP_DB_NAME = `cms-restore-rehearsal-${RUN_ID}`;
const MAX_POLLS = 60;
const POLL_DELAY_MS = 2000;

if (!ACCOUNT_ID || !API_TOKEN || !PRODUCTION_DB_ID) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN and CMS_D1_DATABASE_ID are required.");
}

const headers = {
  Authorization: "Bearer " + API_TOKEN,
  Accept: "application/json",
  "Content-Type": "application/json"
};

async function api(method, path, body) {
  const response = await fetch(API_ROOT + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const raw = await response.text();
  let payload;
  try { payload = raw ? JSON.parse(raw) : {}; }
  catch { throw new Error(`Cloudflare API returned non-JSON (${response.status}): ${raw.slice(0, 300)}`); }
  if (!response.ok || payload.success === false) {
    throw new Error(`Cloudflare API ${method} ${path} failed (${response.status}): ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function queryDatabase(databaseId, sql) {
  const payload = await api("POST", `${API_BASE}/database/${databaseId}/query`, { sql });
  const item = payload.result?.[0];
  if (!item || item.success === false) throw new Error("D1 query failed: " + JSON.stringify(item || payload));
  return item.results || [];
}

async function snapshot(databaseId) {
  const count = async (table) => {
    const rows = await queryDatabase(databaseId, `SELECT COUNT(*) AS count FROM ${table}`);
    return Number(rows[0]?.count ?? -1);
  };
  const [items, variants, revisions, submissions, localeRows, foreignKeys] = await Promise.all([
    count("content_items"),
    count("content_variants"),
    count("content_revisions"),
    count("cms_submissions"),
    queryDatabase(databaseId, "SELECT locale, COUNT(*) AS count FROM content_variants GROUP BY locale ORDER BY locale"),
    queryDatabase(databaseId, "PRAGMA foreign_key_check")
  ]);
  return {
    content_items: items,
    content_variants: variants,
    content_revisions: revisions,
    cms_submissions: submissions,
    locales: Object.fromEntries(localeRows.map((row) => [row.locale, Number(row.count)])),
    foreign_key_violations: foreignKeys.length
  };
}

async function pollExport(bookmark) {
  let current = bookmark;
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const payload = await api("POST", `${API_BASE}/database/${PRODUCTION_DB_ID}/export`, {
      output_format: "polling",
      current_bookmark: current
    });
    const result = payload.result;
    if (result?.status === "complete") {
      if (!result.result?.signed_url) throw new Error("D1 export completed without a signed SQL URL.");
      return result.result;
    }
    if (result?.status === "error") throw new Error("D1 export failed: " + (result.error || JSON.stringify(result)));
    current = result?.at_bookmark || current;
    await sleep(POLL_DELAY_MS);
  }
  throw new Error("D1 export did not complete before the polling deadline.");
}

async function pollImport(bookmark) {
  let current = bookmark;
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const payload = await api("POST", `${API_BASE}/database/${temporaryDatabase.uuid}/import`, {
      action: "poll",
      current_bookmark: current
    });
    const result = payload.result;
    if (result?.status === "complete") return result;
    if (result?.status === "error") throw new Error("D1 import failed: " + (result.error || JSON.stringify(result)));
    current = result?.at_bookmark || current;
    await sleep(POLL_DELAY_MS);
  }
  throw new Error("D1 import did not complete before the polling deadline.");
}

let temporaryDatabase = null;
let failure = null;
let tempDirectory = null;
let summary = null;

try {
  const productionBefore = await snapshot(PRODUCTION_DB_ID);
  if (productionBefore.foreign_key_violations !== 0) {
    throw new Error("Production D1 currently has foreign-key violations; refusing to call the backup rehearsal clean.");
  }

  const exportStart = await api("POST", `${API_BASE}/database/${PRODUCTION_DB_ID}/export`, {
    output_format: "polling",
    dump_options: { compatibility: "d1" }
  });
  if (exportStart.result?.status === "error") throw new Error("D1 export failed: " + exportStart.result.error);
  const exported = exportStart.result?.status === "complete"
    ? exportStart.result.result
    : await pollExport(exportStart.result?.at_bookmark);
  const download = await fetch(exported.signed_url);
  if (!download.ok) throw new Error(`Signed SQL download failed with HTTP ${download.status}.`);
  const sqlBytes = new Uint8Array(await download.arrayBuffer());
  if (sqlBytes.byteLength === 0) throw new Error("D1 export returned an empty SQL dump.");

  const sha256 = createHash("sha256").update(sqlBytes).digest("hex");
  const etag = createHash("md5").update(sqlBytes).digest("hex");
  tempDirectory = await mkdtemp(join(tmpdir(), "cms-d1-restore-"));
  const dumpPath = join(tempDirectory, "production-d1-export.sql");
  await writeFile(dumpPath, sqlBytes, { mode: 0o600 });

  const existing = await api("GET", `${API_BASE}/database?name=${encodeURIComponent(TEMP_DB_NAME)}`);
  if (Array.isArray(existing.result) && existing.result.length > 0) {
    throw new Error("A temporary database with this run ID already exists; refusing to reuse it.");
  }

  const created = await api("POST", `${API_BASE}/database`, {
    name: TEMP_DB_NAME,
    jurisdiction: "us",
    primary_location_hint: "wnam",
    read_replication: { mode: "disabled" }
  });
  temporaryDatabase = created.result;
  if (!temporaryDatabase?.uuid) throw new Error("Cloudflare did not return the temporary D1 database ID.");

  const init = await api("POST", `${API_BASE}/database/${temporaryDatabase.uuid}/import`, {
    action: "init",
    etag
  });
  const uploadUrl = init.result?.upload_url;
  const filename = init.result?.filename;
  if (!uploadUrl || !filename) throw new Error("D1 import initialization did not return its upload URL and filename.");

  const upload = await fetch(uploadUrl, { method: "PUT", body: sqlBytes });
  if (!upload.ok) throw new Error(`D1 SQL upload failed with HTTP ${upload.status}.`);

  const ingest = await api("POST", `${API_BASE}/database/${temporaryDatabase.uuid}/import`, {
    action: "ingest",
    etag,
    filename
  });
  const imported = ingest.result?.status === "complete"
    ? ingest.result
    : await pollImport(ingest.result?.at_bookmark);
  const restored = await snapshot(temporaryDatabase.uuid);

  if (JSON.stringify(productionBefore) !== JSON.stringify(restored)) {
    throw new Error("Restored row counts/locales/FK checks differ from the pre-export production snapshot. Production may have changed during export.");
  }
  if (restored.foreign_key_violations !== 0) throw new Error("Restored D1 has foreign-key violations.");

  summary = {
    result: "PASS",
    production_database_id: PRODUCTION_DB_ID,
    temporary_database_name: TEMP_DB_NAME,
    temporary_database_id: temporaryDatabase.uuid,
    export_filename: exported.filename || filename,
    export_bytes: sqlBytes.byteLength,
    export_sha256: sha256,
    export_bookmark: exportStart.result?.at_bookmark || null,
    restored
  };
  console.log("D1_BACKUP_RESTORE_REHEARSAL " + JSON.stringify(summary));
} catch (error) {
  failure = error;
  console.error(error?.stack || error);
} finally {
  if (temporaryDatabase?.uuid) {
    try {
      await api("DELETE", `${API_BASE}/database/${temporaryDatabase.uuid}`);
      console.log("Temporary D1 database deleted: " + temporaryDatabase.uuid);
      if (summary) summary.temporary_database_deleted = true;
    } catch (cleanupError) {
      console.error("FAILED TO DELETE TEMPORARY D1 DATABASE " + temporaryDatabase.uuid + ": " + (cleanupError?.stack || cleanupError));
      failure = failure || cleanupError;
    }
  }
  if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
}

if (summary && process.env.GITHUB_STEP_SUMMARY) {
  const markdown = [
    "## D1 native SQL backup/restore rehearsal",
    "",
    "- Result: **PASS**",
    "- Production database: `" + summary.production_database_id + "`",
    "- Temporary database: `" + summary.temporary_database_id + "` (deleted after validation)",
    "- SQL dump size: " + summary.export_bytes + " bytes",
    "- SQL SHA-256: `" + summary.export_sha256 + "`",
    "- Row counts: " + JSON.stringify(summary.restored),
    "",
    "The SQL dump was kept only in the runner's temporary directory and was not uploaded as an artifact."
  ].join("\n") + "\n";
  await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
}

if (failure) process.exitCode = 1;
