import { test, expect } from "@playwright/test";

test("deployed preview serves only the Traditional Chinese authored edition", async ({ page }) => {
  const routes = [
    "/zh-tw/",
    "/zh-tw/learn/",
    "/zh-tw/culture/",
    "/zh-tw/festivals/",
    "/zh-tw/books/",
    "/zh-tw/events/",
    "/zh-tw/about/"
  ];
  for (const path of routes) {
    const response = await page.goto(path);
    expect(response?.status(), path + " should be available").toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  }
  await expect(page.locator("#google_translate_element")).toBeAttached();
  await expect(page.locator('script[src*="translate.google.com/translate_a/element.js"]')).toHaveCount(1);
});

test("culture section displays four illustrated articles and licensed image credits", async ({ page }) => {
  const response = await page.goto("/zh-tw/culture/");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".story-card")).toHaveCount(4);
  await expect(page.locator(".story-card-image img")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "筆墨之間：認識中國書法的線條與氣韻" })).toBeVisible();

  const articleResponse = await page.goto("/zh-tw/culture/chinese-calligraphy/");
  expect(articleResponse?.status()).toBe(200);
  await expect(page.locator(".article-cover img")).toHaveAttribute("src", /wikimedia\.org/);
  await expect(page.locator(".article-image-credit a")).toHaveAttribute("href", /commons\.wikimedia\.org/);
  await expect(page.locator(".article-figure img")).toHaveCount(1);
});

test("legacy language routes redirect to the Traditional Chinese edition", async ({ page }) => {
  const routes = [
    ["/en/", "/zh-tw/"],
    ["/zh-cn/culture/", "/zh-tw/culture/"],
    ["/es/books/", "/zh-tw/books/"]
  ];
  for (const [source, destination] of routes) {
    const response = await page.goto(source);
    expect(response?.status(), source + " should redirect to the authored edition").toBe(200);
    expect(new URL(page.url()).pathname).toBe(destination);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  }
});
