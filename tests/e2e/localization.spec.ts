import { test, expect, type APIRequestContext } from "@playwright/test";

const requireBilingual = process.env.QA_REQUIRE_BILINGUAL === "true";

async function resolveChineseSegment(request: APIRequestContext) {
  const [english, shortChinese, regionChinese] = await Promise.all([
    request.get("/en/"),
    request.get("/zh/"),
    request.get("/zh-cn/")
  ]);
  const englishAvailable = english.status() === 200;
  const shortAvailable = shortChinese.status() === 200;
  const regionAvailable = regionChinese.status() === 200;

  let segment: "zh" | "zh-cn" | null = null;
  if (shortAvailable && regionAvailable) {
    const shortFinalPath = new URL(shortChinese.url()).pathname;
    segment = shortFinalPath.startsWith("/zh-cn/") ? "zh-cn" : "zh";
  } else if (regionAvailable) {
    segment = "zh-cn";
  } else if (shortAvailable) {
    segment = "zh";
  }

  if (!englishAvailable || !segment) {
    if (requireBilingual) {
      throw new Error(
        `Bilingual routes are required but /en/ returned ${english.status()}, /zh/ returned ${shortChinese.status()}, and /zh-cn/ returned ${regionChinese.status()}.`
      );
    }
    test.skip(true, "Neither agreed Chinese route is available yet; bilingual feature branch has not landed.");
  }
  return segment!;
}

const sections = [
  "about", "learn", "culture", "festivals", "books", "events",
  "privacy", "accessibility", "editorial-policy", "contact"
];

test.describe("bilingual routing and SEO", () => {
  for (const locale of ["en", "zh"] as const) {
    test(`${locale} homepage renders with the correct document language`, async ({ page, request }) => {
      const chineseSegment = locale === "zh" ? await resolveChineseSegment(request) : null;
      const segment = locale === "en" ? "en" : chineseSegment!;
      const response = await page.goto(`/${segment}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible();
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toMatch(locale === "en" ? /^en(?:-|$)/ : /^zh(?:-|$)/);
      await expect(page).toHaveTitle(/\S+/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    });
  }

  for (const section of sections) {
    for (const locale of ["en", "zh"] as const) {
      test(`/${locale}/${section}/ renders with locale metadata`, async ({ page, request }) => {
        const chineseSegment = locale === "zh" ? await resolveChineseSegment(request) : null;
        const segment = locale === "en" ? "en" : chineseSegment!;
        const path = `/${segment}/${section}/`;
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
  }

  test("language switcher preserves the equivalent page", async ({ page, request }) => {
    const chineseSegment = await resolveChineseSegment(request);
    await page.goto("/en/about/");
    const chineseLink = page.locator(`a[href="/${chineseSegment}/about/"]`).first();
    await expect(chineseLink).toBeVisible();
    await chineseLink.click();
    await expect(page).toHaveURL(new RegExp(`/\\/${chineseSegment}/about/?$`));
    await expect(page.locator("html")).toHaveAttribute("lang", /^zh(?:-|$)/);
  });

  test("localized pages publish reciprocal hreflang alternates", async ({ page, request }) => {
    const chineseSegment = await resolveChineseSegment(request);
    await page.goto("/en/");
    const alternates = page.locator('link[rel="alternate"][hreflang]');
    expect(await alternates.count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('link[rel="alternate"][hreflang^="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang^="zh"]')).toHaveCount(1);
    const chineseHref = await page.locator('link[rel="alternate"][hreflang^="zh"]').getAttribute("href");
    expect(new URL(chineseHref!, page.url()).pathname).toMatch(new RegExp(`^/${chineseSegment}/$`));
  });

  test("legacy English URL redirects to its localized equivalent", async ({ page, request }) => {
    await resolveChineseSegment(request);
    await page.goto("/about/");
    await expect(page).toHaveURL(/\/en\/about\/?$/);
  });

  test("sitemap is published", async ({ request }) => {
    await resolveChineseSegment(request);
    let response = await request.get("/sitemap-index.xml");
    if (response.status() === 404) response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/<sitemapindex|<urlset/i);
  });

  test("configured missing-translation route renders a graceful fallback", async ({ page, request }) => {
    await resolveChineseSegment(request);
    const path = process.env.QA_MISSING_TRANSLATION_PATH;
    test.skip(!path, "Set QA_MISSING_TRANSLATION_PATH to the agreed untranslated content route.");
    const response = await page.goto(path!);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
  });
});
