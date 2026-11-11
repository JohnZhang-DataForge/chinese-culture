import assert from "node:assert/strict";

const protectedSiteUrl = (process.env.PROTECTED_SITE_URL || "https://chinese-culture.site").replace(/\/$/, "");
const browserUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function resolveDeploymentUrl() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const project = process.env.CLOUDFLARE_PAGES_PROJECT || "chinese-culture";
  if (!token || !accountId) throw new Error("Cloudflare deployment lookup credentials are required for production smoke.");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project}/deployments?env=production&per_page=5`, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error("Could not look up the latest Pages production deployment (HTTP " + response.status + ").");
  const payload = await response.json();
  const deployment = (payload.result || []).find((item) => item.environment === "production" && item.latest_stage?.status === "success");
  if (!deployment?.url) throw new Error("No successful Pages production deployment URL was returned.");
  return deployment.url.replace(/\/$/, "");
}

const baseUrl = (process.env.PUBLIC_SITE_URL || await resolveDeploymentUrl()).replace(/\/$/, "");
async function request(path, headers = {}, origin = baseUrl) {
  return fetch(origin + path, {
    method: "GET",
    redirect: "manual",
    headers: { "user-agent": browserUserAgent, ...headers },
    signal: AbortSignal.timeout(20_000)
  });
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestPublicPage(page) {
  const retryDelays = [0, 2_000, 4_000, 8_000, 8_000, 8_000];
  let lastFailure = null;

  for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
    if (retryDelays[attempt]) await sleep(retryDelays[attempt]);
    const response = await request(page.path);
    if (response.status === 200) return response;

    const body = (await response.text()).slice(0, 500);
    lastFailure = { status: response.status, body };

    // Pages custom-domain activation can briefly lag the successful deployment.
    // Retry only server errors; client errors are deterministic and should fail fast.
    if (response.status < 500 || attempt === retryDelays.length - 1) break;
  }

  throw new Error(
    page.path + " should return HTTP 200 after deployment; last response was HTTP " +
    lastFailure?.status + " with body: " + (lastFailure?.body || "(empty)")
  );
}

const publicPages = [
  { path: "/en/", language: "en" },
  { path: "/zh-cn/", language: "zh-CN" },
  { path: "/es/", language: "es" },
  { path: "/en/books/journey-to-the-west/", language: "en" },
  { path: "/zh-cn/books/journey-to-the-west/", language: "zh-CN" },
  { path: "/es/books/journey-to-the-west/", language: "es" }
];

for (const page of publicPages) {
  const response = await requestPublicPage(page);
  const html = await response.text();
  assert.ok(html.includes('<html lang="' + page.language + '"'), page.path + " should declare the expected language");
  assert.ok(html.includes("Chinese Culture Atlas"), page.path + " should render the site shell");
}

const sitemapResponse = await request("/sitemap.xml");
assert.equal(sitemapResponse.status, 200, "sitemap.xml should be publicly available");
assert.match(sitemapResponse.headers.get("content-type") || "", /application\/xml|text\/xml/i, "sitemap should use an XML content type");
const sitemap = await sitemapResponse.text();
assert.ok(sitemap.includes("<urlset"), "sitemap should contain a urlset");
assert.ok((sitemap.match(/<url>/g) || []).length >= 60, "sitemap should include localized static pages and published articles");
for (const path of [
  "/en/books/journey-to-the-west/",
  "/zh-cn/books/journey-to-the-west/",
  "/es/books/journey-to-the-west/"
]) assert.ok(sitemap.includes("https://chinese-culture.site" + path), "sitemap should include " + path);

for (const missing of [
  { path: "/zh-cn/__production-smoke-missing-route__/", text: "这里暂时没有这个故事" },
  { path: "/es/__production-smoke-missing-route__/", text: "Esta historia aún no está aquí" },
  { path: "/en/__production-smoke-missing-route__/", text: "This path has no story yet." }
]) {
  const response = await request(missing.path);
  assert.equal(response.status, 404, missing.path + " should return HTTP 404");
  const html = await response.text();
  assert.ok(html.includes(missing.text), missing.path + " should show the localized 404 message");
}

for (const path of ["/admin/", "/api/admin/v1/session"]) {
  const response = await request(path, { accept: "application/json" }, protectedSiteUrl);
  const location = response.headers.get("location") || "";
  const accessRedirect = [301, 302, 303, 307, 308].includes(response.status) &&
    location.includes("/cdn-cgi/access/login/");
  assert.ok(
    accessRedirect || [401, 403].includes(response.status),
    path + " must deny unauthenticated requests before reaching the protected resource; received HTTP " +
      response.status + " and location " + (location || "(none)")
  );
}

const www = await fetch("https://www.chinese-culture.site/", {
  method: "GET",
  redirect: "manual",
  headers: { "user-agent": browserUserAgent },
  signal: AbortSignal.timeout(20_000)
});
assert.ok([301, 308].includes(www.status), "www hostname should permanently redirect to the apex domain");
assert.equal(new URL(www.headers.get("location") || "https://invalid.example").hostname, "chinese-culture.site");

console.log(JSON.stringify({
  publicOrigin: baseUrl,
  protectedOrigin: protectedSiteUrl,
  publicPages: publicPages.length,
  sitemap: "PASS",
  localized404Pages: 3,
  unauthenticatedProtectionResponses: ["/admin/", "/api/admin/v1/session"],
  wwwRedirect: www.status,
  result: "PASS"
}, null, 2));
