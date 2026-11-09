import assert from "node:assert/strict";

const baseUrl = (process.env.PUBLIC_SITE_URL || "https://chinese-culture.site").replace(/\/$/, "");
async function request(path, headers = {}) {
  return fetch(baseUrl + path, {
    method: "GET",
    redirect: "manual",
    headers: { "user-agent": "Chinese-Culture-Production-Smoke/1.0", ...headers },
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

for (const path of ["/admin/", "/api/admin/v1/session"]) {
  const response = await request(path, { accept: "application/json" });
  const location = response.headers.get("location") || "";
  assert.ok(
    [301, 302, 303, 307, 308].includes(response.status) &&
      location.includes("/cdn-cgi/access/login/"),
    path + " must be challenged by Cloudflare Access before reaching the protected resource; received HTTP " +
      response.status + " and location " + (location || "(none)")
  );
}

const www = await fetch("https://www.chinese-culture.site/", {
  method: "GET",
  redirect: "manual",
  headers: { "user-agent": "Chinese-Culture-Production-Smoke/1.0" },
  signal: AbortSignal.timeout(20_000)
});
assert.ok([301, 308].includes(www.status), "www hostname should permanently redirect to the apex domain");
assert.equal(new URL(www.headers.get("location") || "https://invalid.example").hostname, "chinese-culture.site");

console.log(JSON.stringify({
  publicPages: publicPages.length,
  accessProtectedPaths: ["/admin/", "/api/admin/v1/session"],
  wwwRedirect: www.status,
  result: "PASS"
}, null, 2));
