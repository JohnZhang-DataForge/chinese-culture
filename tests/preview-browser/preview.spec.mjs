import { test, expect } from "@playwright/test";

const books = [
  ["dao-de-jing-qian-yi", "道德經淺易"],
  ["lun-yu-qian-yi", "論語淺易"],
  ["da-xue-qian-yi", "大學淺易"],
  ["zhong-yong-qian-yi", "中庸淺易"],
  ["chu-xiu-dao-gan-yan", "初修道感言"]
];

test("deployed preview serves only the Traditional Chinese authored edition", async ({ page }) => {
  for (const path of ["/zh-tw/", "/zh-tw/learn/", "/zh-tw/culture/", "/zh-tw/festivals/", "/zh-tw/books/", "/zh-tw/events/", "/zh-tw/about/"]) {
    const response = await page.goto(path);
    expect(response?.status(), path + " should be available").toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  }
  await expect(page.locator("#google_translate_element")).toBeAttached();
  await expect(page.locator('script[src*="translate.google.com/translate_a/element.js"]')).toHaveCount(1);
});

test("books collection lists exactly the five requested source books", async ({ page }) => {
  const response = await page.goto("/zh-tw/books/");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".story-card")).toHaveCount(5);
  const covers = page.locator(".story-card-image img");
  await expect(covers).toHaveCount(5);
  for (let index = 0; index < books.length; index += 1) {
    await expect(page.getByRole("heading", { name: books[index][1] })).toBeVisible();
    await expect(covers.nth(index)).toHaveAttribute("alt", /原書封面/);
    await covers.nth(index).scrollIntoViewIfNeeded();
    const coverUrl = await covers.nth(index).getAttribute("src");
    const assetResponse = await page.request.get(new URL(coverUrl, page.url()).toString());
    console.log("Book cover asset:", coverUrl, assetResponse.status(), assetResponse.headers()["content-type"]);
    expect(assetResponse.status()).toBe(200);
    await expect.poll(() => covers.nth(index).evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  }
});

test("all five source-book reading pages load their Traditional Chinese text", async ({ page }) => {
  for (const [slug, title] of books) {
    const response = await page.goto("/zh-tw/books/" + slug + "/");
    expect(response?.status(), slug + " should be available").toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
    await expect(page.locator("h1")).toHaveText(title);
    const cover = page.locator(".article-cover img");
    await expect(cover).toHaveAttribute("src", /^\/assets\/books\//);
    await cover.scrollIntoViewIfNeeded();
    const coverUrl = await cover.getAttribute("src");
    const assetResponse = await page.request.get(new URL(coverUrl, page.url()).toString());
    console.log("Article cover asset:", coverUrl, assetResponse.status(), assetResponse.headers()["content-type"]);
    expect(assetResponse.status()).toBe(200);
    await expect.poll(() => cover.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    const prose = page.locator(".prose");
    await expect(prose).toBeVisible();
    expect((await prose.innerText()).length, title + " should include the transcribed source text").toBeGreaterThan(10000);
    await expect(prose.locator("h2").first()).toBeVisible();
  }
});

test("the four interim culture guide routes are no longer published", async ({ page }) => {
  for (const slug of ["chinese-calligraphy", "chinese-tea-culture", "jingdezhen-blue-white-porcelain", "traditional-chinese-courtyard"]) {
    const response = await page.goto("/zh-tw/culture/" + slug + "/");
    expect(response?.status(), slug + " must not be published").toBe(404);
  }
});

test("Google Translate keeps its selector but hides translation banners and hover balloons", async ({ page }) => {
  await page.goto("/zh-tw/books/");
  await expect(page.locator("#google_translate_element")).toBeAttached();
  const overlaysHidden = await page.evaluate(() => {
    const banner = document.createElement("iframe");
    banner.className = "goog-te-banner-frame skiptranslate";
    document.body.append(banner);
    const balloon = document.createElement("div");
    balloon.id = "goog-gt-tt";
    document.body.append(balloon);
    const frame = document.createElement("iframe");
    frame.className = "goog-te-balloon-frame";
    document.body.append(frame);
    const hidden = [banner, balloon, frame].every((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    });
    banner.remove(); balloon.remove(); frame.remove();
    return hidden && getComputedStyle(document.body).top === "0px";
  });
  expect(overlaysHidden).toBe(true);
});

test("Google Translate banner injected after page load is suppressed", async ({ page }) => {
  await page.goto("/zh-tw/books/");
  const result = await page.evaluate(async () => {
    const banner = document.createElement("iframe");
    banner.className = "goog-te-banner-frame skiptranslate";
    banner.style.setProperty("display", "block", "important");
    banner.style.setProperty("visibility", "visible", "important");
    document.body.append(banner);
    document.body.style.setProperty("top", "40px", "important");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const hidden = getComputedStyle(banner).display === "none" || getComputedStyle(banner).visibility === "hidden";
    const bodyTop = document.body.style.getPropertyValue("top");
    banner.remove();
    return { hidden, bodyTop };
  });
  expect(result.hidden).toBe(true);
  expect(result.bodyTop).toBe("0px");
});

test("legacy language routes redirect to the Traditional Chinese edition", async ({ page }) => {
  for (const [source, destination] of [["/en/", "/zh-tw/"], ["/zh-cn/culture/", "/zh-tw/culture/"], ["/es/books/", "/zh-tw/books/"]]) {
    const response = await page.goto(source);
    expect(response?.status(), source + " should redirect to the authored edition").toBe(200);
    expect(new URL(page.url()).pathname).toBe(destination);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  }
});

test("book reading pages fit a mobile viewport without horizontal article overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [slug] of books) {
    await page.goto("/zh-tw/books/" + slug + "/");
    const layout = await page.locator(".prose").evaluate((article) => ({
      width: article.clientWidth,
      scrollWidth: article.scrollWidth,
      right: Math.round(article.getBoundingClientRect().right)
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
    expect(layout.right).toBeLessThanOrEqual(391);
  }
});
