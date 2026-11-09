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
    await page.getByRole("button", { name: /Create content/ }).click();
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

  test("supports narrow-screen navigation and Escape dismissal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/");
    const sidebar = page.locator("#admin-sidebar");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(sidebar).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(sidebar).not.toHaveClass(/is-open/);
    await page.locator('[data-nav="languages"]').click();
    await expect(page.getByRole("heading", { name: "Language management" })).toBeVisible();
    await expect(page.locator("[data-language-rows]")).toContainText("Learning guides");
  });

  test("keeps the editor operable by keyboard and exposes form labels", async ({ page }) => {
    await page.goto("/admin/");
    await page.getByRole("button", { name: /Create content/ }).click();
    const title = page.locator('[name="title.en"]');
    await title.focus();
    await expect(title).toBeFocused();
    await page.keyboard.press("Tab");
    const slug = page.locator('[name="slug.en"]');
    await expect(slug).toBeFocused();
    await expect(page.getByLabel("Article body", { exact: true })).toBeVisible();
    await expect(page.locator('[data-page="editor"]')).toBeVisible();
    const focusStyle = await slug.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
    });
    expect(focusStyle).toBeTruthy();
  });
});
