import { test, expect } from "@playwright/test";
import { assertCmsMutationAllowed, cmsMutationEnabled } from "../helpers/qa-env.mjs";

const baseURL = process.env.QA_BASE_URL || "";
const requireAdmin = process.env.QA_REQUIRE_ADMIN === "true";
const accessCookie = process.env.QA_ACCESS_COOKIE;
const isPreview = process.env.QA_ENVIRONMENT === "preview";
const prefix = process.env.QA_TEST_CONTENT_PREFIX || "qa-agent6";
const apiRoot = "/api/admin/v1";

test.describe("Admin browser experience", () => {
  test("anonymous browser is challenged before the Admin dashboard is served", async ({ browser }) => {
    test.skip(!requireAdmin || !isPreview || !baseURL, "Requires a deployed preview with Cloudflare Access enabled.");
    const context = await browser.newContext({
      baseURL,
      extraHTTPHeaders: { Cookie: "" }
    });
    try {
      const page = await context.newPage();
      const response = await page.goto("/admin/");
      const status = response?.status() ?? 0;
      const finalPath = new URL(page.url()).pathname;
      const body = await page.locator("body").innerText().catch(() => "");
      const challenged =
        [401, 403].includes(status) ||
        finalPath.startsWith("/cdn-cgi/access/login") ||
        /cloudflare access|one-time pin|enter your email/i.test(body);
      expect(challenged, "Unauthenticated request reached the Admin dashboard").toBe(true);
    } finally {
      await context.close();
    }
  });

  test("owner dashboard exposes the expected navigation and bilingual editor", async ({ page }) => {
    test.skip(!requireAdmin || !isPreview || !baseURL || !accessCookie, "Requires owner Access session against an isolated preview.");
    const response = await page.goto("/admin/");
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-page="dashboard"]')).toBeVisible();

    for (const nav of [
      "dashboard", "articles", "lessons", "festivals", "books",
      "events", "homepage", "settings", "languages"
    ]) {
      await expect(page.locator(`[data-nav="${nav}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-nav="media"]')).toBeDisabled();

    await page.locator('[data-nav="articles"]').click();
    await expect(page.locator('[data-page="content"]')).toBeVisible();
    await page.locator('[data-action="new-content"]').click();
    await expect(page.locator('[data-page="editor"]')).toBeVisible();

    for (const selector of [
      'input[name="title.en"]',
      'input[name="title.zh"]',
      'input[name="slug.en"]',
      'input[name="slug.zh"]',
      'textarea[name="body.en"]',
      'textarea[name="body.zh"]',
      'input[name="tags.en"]',
      'input[name="tags.zh"]',
      'input[name="seoTitle.en"]',
      'input[name="seoTitle.zh"]',
      'textarea[name="seoDescription.en"]',
      'textarea[name="seoDescription.zh"]'
    ]) {
      await expect(page.locator(selector)).toBeEnabled();
    }

    await page.locator('[data-nav="homepage"]').click();
    await expect(page.locator('[data-page="homepage"]')).toBeVisible();
    await expect(page.locator('[data-page="homepage"] [data-action="save-settings"]')).toBeDisabled();

    await page.locator('[data-nav="settings"]').click();
    await expect(page.locator('[data-page="settings"]')).toBeVisible();
    await expect(page.locator('[data-page="settings"] [data-action="save-settings"]')).toBeDisabled();
  });

  test("owner can create, preview and discard a bilingual QA draft through the browser", async ({ page, request }) => {
    test.skip(
      !cmsMutationEnabled(process.env, baseURL),
      "Requires an explicitly authorized, isolated Preview target; browser CMS mutations are disabled by default."
    );
    assertCmsMutationAllowed(process.env, baseURL);

    const origin = new URL(baseURL).origin;
    const sessionResponse = await request.get(`${apiRoot}/session`);
    expect(sessionResponse.status()).toBe(200);
    const session = await sessionResponse.json();
    const mutationHeaders = {
      "X-CSRF-Token": session.csrfToken,
      Origin: origin,
      "Sec-Fetch-Site": "same-origin"
    };
    const slug = `${prefix}-ui-${Date.now()}`;
    let contentId = "";

    try {
      await page.goto("/admin/");
      await page.locator('[data-nav="articles"]').click();
      await page.locator('[data-page="content"] [data-action="new-content"]').click();

      await page.locator('input[name="title.en"]').fill("QA Browser Article");
      await page.locator('input[name="slug.en"]').fill(slug);
      await page.locator('textarea[name="description.en"]').fill("Temporary browser E2E content.");
      await page.locator('input[name="category.en"]').fill("QA");
      await page.locator('input[name="tags.en"]').fill("qa, browser");
      await page.locator('textarea[name="body.en"]').fill("# QA browser draft\n\nEnglish test body.");
      await page.locator('input[name="seoTitle.en"]').fill("QA Browser Article | QA");
      await page.locator('textarea[name="seoDescription.en"]').fill("Temporary English SEO description.");

      await page.locator('input[name="title.zh"]').fill("浏览器质量保证文章");
      await page.locator('input[name="slug.zh"]').fill(`${slug}-zh`);
      await page.locator('textarea[name="description.zh"]').fill("临时浏览器 E2E 内容。");
      await page.locator('input[name="category.zh"]').fill("质量保证");
      await page.locator('input[name="tags.zh"]').fill("质量保证, 浏览器");
      await page.locator('textarea[name="body.zh"]').fill("# 浏览器测试草稿\n\n中文测试正文。");
      await page.locator('input[name="seoTitle.zh"]').fill("浏览器质量保证文章 | QA");
      await page.locator('textarea[name="seoDescription.zh"]').fill("临时中文 SEO 描述。");

      await page.locator('[data-action="save-draft"]').first().click();
      await expect(page.locator('[data-save-state]')).toContainText(/saved/i);
      contentId = await page.locator('input[name="id"]').inputValue();
      expect(contentId).toMatch(/^[0-9a-f-]{36}$/i);

      await page.locator('[data-action="preview"]').first().click();
      await expect(page.locator('[data-preview-dialog]')).toBeVisible();
      await page.locator('[data-action="close-preview"]').click();
      await expect(page.locator('[data-preview-dialog]')).not.toBeVisible();

      await page.locator('[data-action="delete-current"]').click();
      await expect(page.locator('[data-confirm-dialog]')).toBeVisible();
      await page.locator('[data-action="confirm-delete"]').click();
      await expect(page.locator('[data-confirm-dialog]')).not.toBeVisible();
      await expect(page.locator('[data-toast-region]')).toContainText(/discard|delete/i);
      contentId = "";
    } finally {
      if (contentId) {
        for (const locale of ["en", "zh-CN"]) {
          await request.delete(
            `${apiRoot}/content/${contentId}/draft?locale=${encodeURIComponent(locale)}`,
            { headers: mutationHeaders }
          ).catch(() => undefined);
        }
      }
    }
  });
});
