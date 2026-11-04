import { test, expect, type APIRequestContext } from "@playwright/test";

const requireBilingual = process.env.QA_REQUIRE_BILINGUAL === "true";

async function requireLocalizedRoutes(request: APIRequestContext) {
  const [english, chinese] = await Promise.all([
    request.get("/en/"),
    request.get("/zh/")
  ]);
  const available = english.status() === 200 && chinese.status() === 200;
  if (!available && requireBilingual) {
    throw new Error(
      `Bilingual routes are required but /en/ returned ${english.status()} and /zh/ returned ${chinese.status()}.`
    );
  }
  test.skip(!available, "Bilingual routes are not merged yet; set QA_REQUIRE_BILINGUAL=true for release acceptance.");
}

const localizedRoutes = [
  ["/en/", "en"], ["/zh/", "zh"],
  ["/en/about/", "en"], ["/zh/about/", "zh"],
  ["/en/learn/", "en"], ["/zh/learn/", "zh"],
  ["/en/culture/", "en"], ["/zh/culture/", "zh"],
  ["/en/festivals/", "en"], ["/zh/festivals/", "zh"],
  ["/en/books/", "en"], ["/zh/books/", "zh"],
  ["/en/events/", "en"], ["/zh/events/", "zh"],
  ["/en/privacy/", "en"], ["/zh/privacy/", "zh"],
  ["/en/accessibility/", "en"], ["/zh/accessibility/", "zh"],
  ["/en/editorial-policy/", "en"], ["/zh/editorial-policy/", "zh"],
  ["/en/contact/", "en"], ["/zh/contact/", "zh"]
] as const;

test.describe("bilingual routing and SEO", () => {
  for (const [path, locale] of localizedRoutes) {
    test(`${path} renders with the correct language and SEO metadata`, async ({ page, request }) => {
      await requireLocalizedRoutes(request);
      const response = await page.goto(path);
      expect(response?.status(), `${path} returned HTTP ${response?.status()}`).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible();
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toMatch(locale === "en" ? /^en(?:-|$)/ : /^zh(?:-|$)/);
      await expect(page).toHaveTitle(/\S+/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    });
  }

  test("language switcher preserves the equivalent page", async ({ page, request }) => {
    await requireLocalizedRoutes(request);
    await page.goto("/en/about/");
    const chineseLink = page.locator('a[href="/zh/about/"]').first();
    await expect(chineseLink).toBeVisible();
    await chineseLink.click();
    await expect(page).toHaveURL(/\/zh\/about\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", /^zh(?:-|$)/);
  });

  test("localized pages publish reciprocal hreflang alternates", async ({ page, request }) => {
    await requireLocalizedRoutes(request);
    await page.goto("/en/");
    const alternates = page.locator('link[rel="alternate"][hreflang]');
    expect(await alternates.count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('link[rel="alternate"][hreflang^="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang^="zh"]')).toHaveCount(1);
  });

  test("legacy English URL redirects to its localized equivalent", async ({ page, request }) => {
    await requireLocalizedRoutes(request);
    await page.goto("/about/");
    await expect(page).toHaveURL(/\/en\/about\/?$/);
  });

  test("sitemap is published", async ({ request }) => {
    await requireLocalizedRoutes(request);
    let response = await request.get("/sitemap-index.xml");
    if (response.status() === 404) response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/<sitemapindex|<urlset/i);
  });

  test("configured missing-translation route renders a graceful fallback", async ({ page, request }) => {
    await requireLocalizedRoutes(request);
    const path = process.env.QA_MISSING_TRANSLATION_PATH;
    test.skip(!path, "Set QA_MISSING_TRANSLATION_PATH to the agreed untranslated content route.");
    const response = await page.goto(path!);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
  });
});
