export const PRODUCTION_HOSTS = new Set([
  "chinese-culture.site",
  "www.chinese-culture.site",
  "chinese-culture-79h.pages.dev",
  "main.chinese-culture-79h.pages.dev",
  "production.chinese-culture-79h.pages.dev"
]);

export function cmsMutationEnabled(env = process.env, baseURL = env.QA_BASE_URL || "http://127.0.0.1:4321") {
  let hostname;
  try {
    hostname = new URL(baseURL).hostname.toLowerCase();
  } catch {
    return false;
  }

  const prefix = env.QA_TEST_CONTENT_PREFIX || "";
  const isProductionCustomDomain =
    hostname === "chinese-culture.site" || hostname.endsWith(".chinese-culture.site");
  return (
    env.QA_ENABLE_CMS_MUTATIONS === "true" &&
    env.QA_ENVIRONMENT === "preview" &&
    Boolean(env.QA_ACCESS_COOKIE?.trim()) &&
    /^qa-[a-z0-9][a-z0-9-]{2,40}$/.test(prefix) &&
    !PRODUCTION_HOSTS.has(hostname) &&
    !isProductionCustomDomain
  );
}

export function assertCmsMutationAllowed(env = process.env, baseURL = env.QA_BASE_URL || "http://127.0.0.1:4321") {
  if (!cmsMutationEnabled(env, baseURL)) {
    throw new Error(
      "CMS mutations are disabled. Require QA_ENABLE_CMS_MUTATIONS=true, QA_ENVIRONMENT=preview, " +
      "a QA_ACCESS_COOKIE, a QA_TEST_CONTENT_PREFIX beginning with qa-, and a non-production target."
    );
  }
  return new URL(baseURL);
}
