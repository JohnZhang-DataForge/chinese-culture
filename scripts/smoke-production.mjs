import assert from "node:assert/strict";

const baseUrl = (process.env.PUBLIC_SITE_URL || "https://chinese-culture.site").replace(/\/$/, "");
const timeout = AbortSignal.timeout(20_000);

async function request(path, headers = {}) {
  return fetch(baseUrl + path, {
    method: "GET",
    redirect: "manual",
    headers: { "user-agent": "Chinese-Culture-Production-Smoke/1.0", ...headers },
    signal: timeout
  });
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
  const response = await request(page.path);
  assert.equal(response.status, 200, page.path + " should return HTTP 200");
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
  signal: timeout
});
assert.ok([301, 308].includes(www.status), "www hostname should permanently redirect to the apex domain");
assert.equal(new URL(www.headers.get("location") || "https://invalid.example").hostname, "chinese-culture.site");

console.log(JSON.stringify({
  publicPages: publicPages.length,
  accessProtectedPaths: ["/admin/", "/api/admin/v1/session"],
  wwwRedirect: www.status,
  result: "PASS"
}, null, 2));
