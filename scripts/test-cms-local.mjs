import { spawn } from "node:child_process";
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

async function main() {
  const session = await waitUntilReady();
  if (session.email !== email || session.capabilities?.publish !== false) throw new Error("Local CMS session/capabilities are incorrect.");
  const headers = {
    "Content-Type": "application/json",
    "Origin": origin,
    "X-CSRF-Token": session.csrfToken
  };
  const payload = {
    locale: "en",
    collection: "culture",
    slug: "cms-integration-smoke",
    title: "CMS integration smoke test",
    description: "A temporary article used to verify D1 CRUD.",
    category: "Testing",
    bodyMarkdown: "## D1 round trip\n\nThis article verifies create, read, update and preview.",
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

  const read = await request("/api/admin/v1/content/" + id + "?locale=en");
  if (!read.response.ok || read.data?.title !== payload.title) throw new Error("Read content failed: " + JSON.stringify(read.data));

  const updatedPayload = { ...payload, title: "CMS integration smoke test updated", bodyMarkdown: payload.bodyMarkdown + "\n\nUpdated revision." };
  const updated = await request("/api/admin/v1/content/" + id + "?locale=en", { method: "PUT", headers: { ...headers, "If-Match": etag }, body: JSON.stringify(updatedPayload) });
  if (!updated.response.ok || updated.data?.title !== updatedPayload.title) throw new Error("Update content failed: " + JSON.stringify(updated.data));
  etag = updated.response.headers.get("etag");
  if (!etag || etag === '"1"') throw new Error("Draft update did not advance the revision ETag.");

  const spanish = {
    ...payload,
    locale: "es",
    slug: "cms-integration-smoke-es",
    title: "Prueba de integración del CMS",
    description: "Artículo temporal para comprobar las traducciones.",
    category: "Pruebas",
    bodyMarkdown: "## Prueba D1\n\nContenido en español."
  };
  const translation = await request("/api/admin/v1/content/" + id + "/translations", { method: "POST", headers, body: JSON.stringify(spanish) });
  if (translation.response.status !== 201 || translation.data?.locale !== "es") throw new Error("Create Spanish translation failed: " + JSON.stringify(translation.data));

  const preview = await request("/api/admin/v1/content/" + id + "/preview", { method: "POST", headers, body: JSON.stringify({ content: updatedPayload }) });
  if (!preview.response.ok || !String(preview.data?.html || "").includes("<h2>D1 round trip</h2>")) {
    throw new Error("Safe preview failed: " + JSON.stringify(preview.data));
  }

  const list = await request("/api/admin/v1/content?locale=es&page=1&pageSize=100");
  if (!list.response.ok || !list.data?.items?.some((item) => item.contentId === id)) throw new Error("Spanish content list failed: " + JSON.stringify(list.data));

  const submit = await request("/api/admin/v1/content/" + id + "/submit?locale=en", { method: "POST", headers: { ...headers, "If-Match": etag }, body: JSON.stringify({ intent: "review", summary: "CI verifies publication fails closed without a GitHub App." }) });
  if (submit.response.status !== 503 || submit.data?.code !== "github_app_not_configured") {
    throw new Error("Publication should fail closed without GitHub App credentials: " + JSON.stringify(submit.data));
  }

  const deleteSpanish = await request("/api/admin/v1/content/" + id + "/draft?locale=es", { method: "DELETE", headers });
  if (deleteSpanish.response.status !== 204) throw new Error("Delete Spanish draft failed: " + JSON.stringify(deleteSpanish.data));
  const deleteEnglish = await request("/api/admin/v1/content/" + id + "/draft?locale=en", { method: "DELETE", headers });
  if (deleteEnglish.response.status !== 204) throw new Error("Delete English draft failed: " + JSON.stringify(deleteEnglish.data));

  console.log("PASS: local Pages Functions session, D1 create/read/update, ETags, Spanish translation, safe preview, list, publication fail-closed and draft deletion.");
}

try {
  await main();
} finally {
  try {
    if (child.pid) process.kill(-child.pid, "SIGTERM");
  } catch {}
  try { unlinkSync(devVars); } catch {}
}
