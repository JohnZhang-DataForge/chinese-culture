import { test, expect } from "@playwright/test";

test("dashboard, bilingual editor and server-preview affordances render", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page.getByRole("heading",{name:"Good morning, editor."})).toBeVisible();

  await page.locator('[data-nav="articles"]').click();
  await expect(page.locator("[data-content-heading]")).toHaveText("Articles");
  await page.locator("[data-list-search]").fill("calligraphy");
  await expect(page.locator("[data-content-rows]")).toContainText("The art of calligraphy");

  await page.locator('[data-content-rows] [data-action="edit"]').first().click();
  await expect(page.locator('[name="title.en"]')).toHaveValue("The art of calligraphy");
  await expect(page.locator('[name="title.zh"]')).toHaveValue("书法艺术");
  await expect(page.locator('[name="body.en"]')).toBeVisible();
  await expect(page.locator('[name="body.zh"]')).toBeVisible();

  await page.locator('[name="title.zh"]').fill("书法艺术 · 文化");
  await page.locator('[data-page="editor"] [data-action="preview"]').first().click();
  await expect(page.locator("[data-preview-dialog]")).toBeVisible();
  await expect(page.locator("[data-preview-title]")).toHaveText("The art of calligraphy");

  await page.locator('[data-preview-language="zh"]').click();
  await expect(page.locator("[data-preview-title]")).toHaveText("书法艺术 · 文化");
  await page.locator('[data-action="close-preview"]').click();

  await page.locator('[data-page="editor"] [data-action="save-draft"]').first().click();
  await expect(page.locator("[data-toast-region]")).toContainText("Draft saved in development preview");
  await page.screenshot({ path: "test-results/admin-bilingual-editor.png", fullPage: true });
});

test("creates and discards a bilingual draft with confirmation", async ({ page }) => {
  await page.goto("/admin/");
  await page.locator('[data-nav="articles"]').click();
  await page.locator('[data-action="new-content"]').last().click();

  await page.locator('[name="title.en"]').fill("E2E sample article");
  await page.locator('[name="slug.en"]').fill("e2e-sample-article");
  await page.locator('[name="description.en"]').fill("A browser test article.");
  await page.locator('[name="category.en"]').fill("Testing");
  await page.locator('[name="tags.en"]').fill("test, browser");
  await page.locator('[name="body.en"]').fill("## English sample\n\nThis is a browser test.");

  await page.locator('[name="title.zh"]').fill("浏览器测试文章");
  await page.locator('[name="slug.zh"]').fill("e2e-sample-article-zh");
  await page.locator('[name="description.zh"]').fill("一篇浏览器自动化测试文章。");
  await page.locator('[name="category.zh"]').fill("测试");
  await page.locator('[name="tags.zh"]').fill("测试, 浏览器");
  await page.locator('[name="body.zh"]').fill("## 中文示例\n\n这是一篇浏览器测试。");

  await page.locator('[data-page="editor"] [data-action="save-draft"]').first().click();
  await expect(page.locator("[data-toast-region]")).toContainText("Draft saved in development preview");

  await page.locator('[data-action="back-to-list"]').click();
  await page.locator("[data-list-search]").fill("E2E sample article");
  await expect(page.locator("[data-content-rows]")).toContainText("E2E sample article");

  await page.locator('[data-content-rows] [data-action="delete"]').first().click();
  await expect(page.locator("[data-confirm-dialog]")).toBeVisible();
  await page.locator('[data-action="confirm-delete"]').click();
  await expect(page.locator("[data-content-rows]")).not.toContainText("E2E sample article");
});

test("mobile navigation opens and switches admin sections", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/admin/");
  await page.locator('[data-action="toggle-sidebar"]').click();
  await expect(page.locator("#admin-sidebar")).toHaveClass(/is-open/);
  await page.locator('[data-nav="languages"]').click();
  await expect(page.getByRole("heading",{name:"Language management"})).toBeVisible();
  await expect(page.locator("#admin-sidebar")).not.toHaveClass(/is-open/);
});
