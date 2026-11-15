import { test, expect } from "@playwright/test";

test.describe("Admin editorial studio — Traditional Chinese edition", () => {
  test("navigates the content library and searches Traditional Chinese titles", async ({ page }) => {
    await page.goto("/admin/");
    await expect(page.getByRole("heading", { name: "Good morning, editor." })).toBeVisible();
    await expect(page.locator("[data-stat='total']")).toHaveText("5");
    await page.locator('[data-nav="articles"]').click();
    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
    await expect(page.locator("[data-content-rows] tr")).toHaveCount(1);
    await expect(page.locator("[data-content-rows]")).toContainText("書法藝術");
    await page.getByRole("searchbox", { name: "Search this collection" }).fill("沒有這篇文章");
    await expect(page.locator("[data-content-rows]")).toContainText("No content matches");
    await page.getByRole("button", { name: /Reset/ }).click();
    await expect(page.locator("[data-content-rows]")).toContainText("書法藝術");
  });

  test("creates a Traditional Chinese draft preview without network mutations", async ({ page }) => {
    const writes = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.url());
    });
    await page.goto("/admin/");
    await page.locator('[data-action="new-content"]').first().click();
    await expect(page.locator('[data-page="editor"]')).toBeVisible();
    await page.locator('[name="title.zh"]').fill("瀏覽器測試文章");
    await page.locator('[name="slug.zh"]').fill("browser-qa-story");
    await page.locator('[name="description.zh"]').fill("這是一篇經過瀏覽器測試的文章草稿。");
    await page.locator('[name="category.zh"]').fill("測試");
    await page.locator('[name="body.zh"]').fill("## 瀏覽器測試\n\n這篇草稿會在本機預覽。");
    await expect(page.locator('[data-language-state="zh"]')).toHaveText("已完成");
    await page.locator('[data-page="editor"] [data-action="preview"]').first().click();
    const dialog = page.locator("[data-preview-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-preview-title]")).toHaveText("瀏覽器測試文章");
    await expect(dialog.locator("[data-preview-body]")).toContainText("這篇草稿會在本機預覽。");
    await dialog.locator('[data-action="close-preview"]').click();
    await page.locator('[data-page="editor"] [data-action="save-draft"]').last().click();
    await expect(page.locator("[data-toast-region]")).toContainText("Draft saved in development preview.");
    await expect(page.locator("[data-save-state]")).toHaveText("All changes saved");
    expect(writes).toEqual([]);
  });

  test("previews the only authored language", async ({ page }) => {
    await page.goto("/admin/");
    await page.locator('[data-action="new-content"]').first().click();
    await page.locator('[name="title.zh"]').fill("繁體中文預覽");
    await page.locator('[name="slug.zh"]').fill("traditional-chinese-preview");
    await page.locator('[name="description.zh"]').fill("繁體中文簡介");
    await page.locator('[name="category.zh"]').fill("文化");
    await page.locator('[name="body.zh"]').fill("## 預覽\n\n這是繁體中文正文。");
    await page.locator('[data-page="editor"] [data-action="preview"]').first().click();
    const dialog = page.locator("[data-preview-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".preview-language-switch")).toContainText("繁體中文預覽");
    await expect(dialog.locator("[data-preview-title]")).toHaveText("繁體中文預覽");
    await expect(dialog.locator("[data-preview-body]")).toContainText("這是繁體中文正文。");
  });

  test("supports narrow-screen navigation and the single-language settings page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/");
    const sidebar = page.locator("#admin-sidebar");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(sidebar).not.toHaveClass(/is-open/);
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator('[data-nav="languages"]').click();
    await expect(page.getByRole("heading", { name: "內容語言" })).toBeVisible();
    await expect(page.locator("[data-page='languages']")).toContainText("繁體中文");
    await expect(page.locator("[data-page='languages']")).not.toContainText("Español");
  });

  test("keeps the Traditional Chinese editor operable by keyboard", async ({ page }) => {
    await page.goto("/admin/");
    await page.locator('[data-action="new-content"]').first().click();
    const title = page.locator('[name="title.zh"]');
    await title.click();
    await expect(title).toBeFocused();
    await page.keyboard.press("Tab");
    const slug = page.locator('[name="slug.zh"]');
    await expect(slug).toBeFocused();
    const articleBody = page.locator('[name="body.zh"]');
    await expect(articleBody).toBeVisible();
    await expect(articleBody).toHaveAccessibleName(/正文/);
    const focusStyle = await slug.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
    });
    expect(focusStyle).toBeTruthy();
  });
});
