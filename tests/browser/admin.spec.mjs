import { test, expect } from "@playwright/test";

test.describe("Admin editorial studio in local development preview", () => {
  test("navigates the content library and filters article rows", async ({ page }) => {
    await page.goto("/admin/");
    await expect(page.getByRole("heading", { name: "Good morning, editor." })).toBeVisible();
    await expect(page.locator("[data-stat='total']")).toHaveText("5");

    await page.locator('[data-nav="articles"]').click();
    await expect(page.getByRole("heading", { name: "Articles" })).toBeVisible();
    await expect(page.locator("[data-content-rows] tr")).toHaveCount(1);
    await expect(page.locator("[data-content-rows]")).toContainText("The art of calligraphy");

    await page.getByRole("searchbox", { name: "Search this collection" }).fill("no matching story");
    await expect(page.locator("[data-content-rows]")).toContainText("No content matches");
    await page.getByRole("button", { name: /Reset/ }).click();
    await expect(page.locator("[data-content-rows]")).toContainText("The art of calligraphy");
  });

  test("creates a draft preview with English content without sending network mutations", async ({ page }) => {
    const writes = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.url());
    });

    await page.goto("/admin/");
    await expect(page.locator('[data-action="new-content"]').first()).toBeVisible();
    await expect(page.locator('[data-action="new-content"]').first()).toBeEnabled();
    page.on("pageerror", (error) => console.log("BROWSER_PAGE_ERROR", error.message));
    await page.locator('[data-action="new-content"]').first().click();
    await expect(page.locator('[data-page="editor"]')).toBeVisible();

    await page.locator('[name="title.en"]').fill("Browser QA story");
    await page.locator('[name="slug.en"]').fill("browser-qa-story");
    await page.locator('[name="description.en"]').fill("A browser-tested editorial draft.");
    await page.locator('[name="category.en"]').fill("Quality assurance");
    await page.locator('[name="body.en"]').fill("## Browser QA\n\nThis draft is previewed locally.");
    await expect(page.locator('[data-language-state="en"]')).toHaveText("Complete");

    await page.locator('[data-page="editor"] [data-action="preview"]').first().click();
    const dialog = page.locator("[data-preview-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-preview-title]")).toHaveText("Browser QA story");
    await expect(dialog.locator("[data-preview-body]")).toContainText("This draft is previewed locally.");
    await dialog.locator('[data-action="close-preview"]').click();

    await page.locator('[data-page="editor"] [data-action="save-draft"]').last().click();
    await expect(page.locator("[data-toast-region]")).toContainText("Draft saved in development preview.");
    await expect(page.locator("[data-save-state]")).toHaveText("All changes saved");
    expect(writes).toEqual([]);
  });

  test("previews English, Simplified Chinese and Spanish independently", async ({ page }) => {
    await page.goto("/admin/");
    await page.locator('[data-action="new-content"]').first().click();
    await expect(page.locator('[data-page="editor"]')).toBeVisible();

    const variants = [
      { locale: "en", title: "English preview", slug: "english-preview", description: "English description", category: "Culture", body: "English body text." },
      { locale: "zh", title: "中文预览", slug: "zhong-wen-yu-lan", description: "中文简介", category: "文化", body: "这是中文正文。" },
      { locale: "es", title: "Vista previa en español", slug: "vista-previa-espanol", description: "Descripción en español", category: "Cultura", body: "Este es el contenido en español." }
    ];

    for (const variant of variants) {
      await page.locator('[name="title.' + variant.locale + '"]').fill(variant.title);
      await page.locator('[name="slug.' + variant.locale + '"]').fill(variant.slug);
      await page.locator('[name="description.' + variant.locale + '"]').fill(variant.description);
      await page.locator('[name="category.' + variant.locale + '"]').fill(variant.category);
      await page.locator('[name="body.' + variant.locale + '"]').fill(variant.body);
      await expect(page.locator('[data-language-state="' + variant.locale + '"]')).toHaveText("Complete");
    }

    await page.locator('[data-page="editor"] [data-action="preview"]').first().click();
    const dialog = page.locator("[data-preview-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-preview-title]")).toHaveText("English preview");
    await expect(dialog.locator("[data-preview-body]")).toContainText("English body text.");

    await dialog.locator('[data-preview-language="zh"]').click();
    await expect(dialog.locator("[data-preview-title]")).toHaveText("中文预览");
    await expect(dialog.locator("[data-preview-body]")).toContainText("这是中文正文。");

    await dialog.locator('[data-preview-language="es"]').click();
    await expect(dialog.locator("[data-preview-title]")).toHaveText("Vista previa en español");
    await expect(dialog.locator("[data-preview-body]")).toContainText("Este es el contenido en español.");
  });

  test("supports narrow-screen navigation and Escape dismissal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/");
    const sidebar = page.locator("#admin-sidebar");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(sidebar).not.toHaveClass(/is-open/);
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar).toHaveClass(/is-open/);
    await page.locator('[data-nav="languages"]').click();
    await expect(page.getByRole("heading", { name: "Language management" })).toBeVisible();
    await expect(page.locator("[data-language-rows]")).toContainText("Learning guides");
  });

  test("keeps the editor operable by keyboard and exposes form labels", async ({ page }) => {
    await page.goto("/admin/");
    await page.locator('[data-action="new-content"]').first().click();
    const title = page.locator('[name="title.en"]');
    await title.click();
    await expect(title).toBeFocused();
    await page.keyboard.press("Tab");
    const slug = page.locator('[name="slug.en"]');
    await expect(slug).toBeFocused();
    const articleBody = page.locator('[name="body.en"]');
    await expect(articleBody).toBeVisible();
    await expect(articleBody).toHaveAccessibleName(/Article body/);
    await expect(page.locator('[data-page="editor"]')).toBeVisible();
    const focusStyle = await slug.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
    });
    expect(focusStyle).toBeTruthy();
  });
});
