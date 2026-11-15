import { spawn, spawnSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const root = process.cwd();
const devVars = root + "/.dev.vars";
const origin = "http://localhost:8788";
const email = "cms-ci-admin@example.test";
const secret = randomBytes(32).toString("hex");
if (existsSync(devVars)) throw new Error("Refusing to overwrite an existing .dev.vars file during CMS integration tests.");

writeFileSync(devVars, [
  "ADMIN_ORIGIN=" + origin,
  "ADMIN_EMAIL=" + email,
  "ADMIN_CSRF_SECRET=" + secret,
  "CMS_LOCAL_AUTH_BYPASS=true"
].join("\n") + "\n", { mode: 0o600 });

const child = spawn("npx", ["wrangler", "pages", "dev", "dist", "--ip", "0.0.0.0", "--port", "8788"], {
  cwd: root,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env
});
let logs = "";
child.stdout.on("data", (chunk) => { logs = (logs + chunk.toString()).slice(-10000); });
child.stderr.on("data", (chunk) => { logs = (logs + chunk.toString()).slice(-10000); });

async function request(path, options = {}) {
  const response = await fetch(origin + path, options);
  const text = await response.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  return { response, data };
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error("Wrangler Pages dev exited early.\n" + logs);
    try {
      const { response, data } = await request("/api/admin/v1/session");
      if (response.ok && data?.csrfToken) return data;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Wrangler Pages dev did not become ready.\n" + logs);
}

function readLocalRevisionHistory(contentId, locale) {
  const sql = "SELECT revision, snapshot_json FROM content_revisions WHERE content_id = '" +
    contentId.replaceAll("'", "''") + "' AND locale = '" + locale.replaceAll("'", "''") +
    "' ORDER BY revision ASC;";
  const result = spawnSync("npx", [
    "wrangler", "d1", "execute", "chinese-culture-cms", "--local", "--json", "--command", sql
  ], { cwd: root, encoding: "utf8", timeout: 30000 });
  if (result.status !== 0) {
    throw new Error("Could not inspect local D1 revision history.\\n" + (result.stderr || result.stdout));
  }

  const output = result.stdout.trim();
  let parsed;
  for (let index = 0; index < output.length; index += 1) {
    if (output[index] !== "[" && output[index] !== "{") continue;
    try { parsed = JSON.parse(output.slice(index)); break; } catch {}
  }
  if (!parsed) throw new Error("Wrangler did not return parseable JSON for revision history: " + output);

  const findRows = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) {
        const rows = findRows(item);
        if (rows) return rows;
      }
    } else if (value && typeof value === "object") {
      if (Array.isArray(value.results)) return value.results;
      for (const item of Object.values(value)) {
        const rows = findRows(item);
        if (rows) return rows;
      }
    }
    return null;
  };
  const rows = findRows(parsed);
  if (!rows) throw new Error("Wrangler JSON did not contain D1 query rows: " + output);
  return rows.map((row) => ({
    revision: Number(row.revision),
    snapshot: typeof row.snapshot_json === "string" ? JSON.parse(row.snapshot_json) : null
  }));
}

async function main() {
  const session = await waitUntilReady();
  if (session.email !== email || session.capabilities?.publish !== false) throw new Error("Local CMS session/capabilities are incorrect.");
  const headers = {
    "Content-Type": "application/json",
    "Origin": origin,
    "X-CSRF-Token": session.csrfToken
  };
  const payload = {
    locale: "zh-TW",
    collection: "culture",
    slug: "cms-integration-smoke",
    title: "CMS 整合測試",
    description: "用於驗證 D1 新增、讀取與更新的暫存文章。",
    category: "測試",
    bodyMarkdown: "## D1 往返測試\n\n這篇文章用於驗證新增、讀取、更新與預覽功能。",
    featured: false,
    readingMinutes: 3,
    tags: [],
    sources: [],
    media: []
  };

  const created = await request("/api/admin/v1/content", { method: "POST", headers, body: JSON.stringify(payload) });
  if (created.response.status !== 201 || !created.data?.contentId) throw new Error("Create content failed: " + JSON.stringify(created.data));
  const id = created.data.contentId;
  let etag = created.response.headers.get("etag");
  if (!etag) throw new Error("Create content did not return an ETag.");
  const originalEtag = etag;

  const read = await request("/api/admin/v1/content/" + id + "?locale=zh-TW");
  if (!read.response.ok || read.data?.title !== payload.title) throw new Error("Read content failed: " + JSON.stringify(read.data));

  const updatedPayload = { ...payload, title: "CMS 整合測試（更新版）", bodyMarkdown: payload.bodyMarkdown + "\n\nUpdated revision." };
  const updated = await request("/api/admin/v1/content/" + id + "?locale=zh-TW", { method: "PUT", headers: { ...headers, "If-Match": etag }, body: JSON.stringify(updatedPayload) });
  if (!updated.response.ok || updated.data?.title !== updatedPayload.title) throw new Error("Update content failed: " + JSON.stringify(updated.data));
  etag = updated.response.headers.get("etag");
  if (!etag || etag === '"1"') throw new Error("Draft update did not advance the revision ETag.");

  const staleWrite = await request("/api/admin/v1/content/" + id + "?locale=zh-TW", {
    method: "PUT",
    headers: { ...headers, "If-Match": originalEtag },
    body: JSON.stringify({ ...updatedPayload, title: "This stale write must be rejected." })
  });
  if (staleWrite.response.status !== 409 || staleWrite.data?.code !== "revision_conflict") {
    throw new Error("A stale If-Match write must return 409 revision_conflict: " + JSON.stringify(staleWrite.data));
  }
  const afterStaleWrite = await request("/api/admin/v1/content/" + id + "?locale=zh-TW");
  if (!afterStaleWrite.response.ok || afterStaleWrite.data?.title !== updatedPayload.title || afterStaleWrite.data?.revision !== "2") {
    throw new Error("A rejected stale write must not alter the latest D1 revision: " + JSON.stringify(afterStaleWrite.data));
  }

  const revisionHistory = readLocalRevisionHistory(id, "zh-TW");
  if (revisionHistory.length !== 2 ||
      revisionHistory[0].revision !== 1 ||
      revisionHistory[1].revision !== 2 ||
      revisionHistory[0].snapshot?.title !== payload.title ||
      revisionHistory[1].snapshot?.title !== updatedPayload.title) {
    throw new Error("D1 must retain exactly the two immutable content_revisions snapshots after the rejected stale write: " +
      JSON.stringify(revisionHistory));
  }

  const unsupported = await request("/api/admin/v1/content", { method: "POST", headers, body: JSON.stringify({ ...payload, locale: "en", slug: "cms-integration-unsupported" }) });
  if (unsupported.response.status !== 400 || unsupported.data?.code !== "invalid_locale") {
    throw new Error("The CMS must reject non-Traditional authored locales: " + JSON.stringify(unsupported.data));
  }

  const preview = await request("/api/admin/v1/content/" + id + "/preview", { method: "POST", headers, body: JSON.stringify({ content: updatedPayload }) });
  if (!preview.response.ok || !String(preview.data?.html || "").includes("<h2>D1 往返測試</h2>")) {
    throw new Error("Safe preview failed: " + JSON.stringify(preview.data));
  }

  const list = await request("/api/admin/v1/content?locale=zh-TW&page=1&pageSize=100");
  if (!list.response.ok || !list.data?.items?.some((item) => item.contentId === id)) throw new Error("Spanish content list failed: " + JSON.stringify(list.data));

  const mediaForm = new FormData();
  mediaForm.append("file", new Blob([Uint8Array.of(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a)], { type: "image/png" }), "smoke.png");
  mediaForm.append("metadata", new Blob([JSON.stringify({ alt: "Test image", credit: "CMS integration test", license: "original" })], { type: "application/json" }), "metadata.json");
  const mediaUpload = await request("/api/admin/v1/content/" + id + "/media?locale=zh-TW", {
    method: "POST",
    headers: { Origin: origin, "X-CSRF-Token": session.csrfToken, "If-Match": etag },
    body: mediaForm
  });
  if (mediaUpload.response.status !== 503 || mediaUpload.data?.code !== "github_app_not_configured") {
    throw new Error("Media upload should fail closed without GitHub App credentials: " + JSON.stringify(mediaUpload.data));
  }

  const submit = await request("/api/admin/v1/content/" + id + "/submit?locale=zh-TW", { method: "POST", headers: { ...headers, "If-Match": etag }, body: JSON.stringify({ intent: "review", summary: "CI verifies publication fails closed without a GitHub App." }) });
  if (submit.response.status !== 503 || submit.data?.code !== "github_app_not_configured") {
    throw new Error("Publication should fail closed without GitHub App credentials: " + JSON.stringify(submit.data));
  }

  const deleteTraditional = await request("/api/admin/v1/content/" + id + "/draft?locale=zh-TW", { method: "DELETE", headers });
  if (deleteTraditional.response.status !== 204) throw new Error("Delete Traditional Chinese draft failed: " + JSON.stringify(deleteTraditional.data));

  console.log("PASS: local Pages Functions session, D1 create/read/update, ETags, immutable D1 revision snapshots, stale-write conflict protection, Traditional Chinese-only locale enforcement, safe preview, list, media/publication fail-closed and draft deletion.");
}

try {
  await main();
} finally {
  try {
    if (child.pid) process.kill(-child.pid, "SIGTERM");
  } catch {}
  try { unlinkSync(devVars); } catch {}
}
