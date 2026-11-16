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
  await expect(page.locator(".article-figure img")).toHaveCount(3);
});

test("Google Translate keeps its selector but hides translation banners and hover balloons", async ({ page }) => {
  await page.goto("/zh-tw/culture/");
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
    banner.remove();
    balloon.remove();
    frame.remove();
    return hidden && getComputedStyle(document.body).top === "0px";
  });
  expect(overlaysHidden).toBe(true);
});

test("Google Translate banner injected after page load is suppressed", async ({ page }) => {
  await page.goto("/zh-tw/culture/");
  const result = await page.evaluate(async () => {
    const banner = document.createElement("iframe");
    banner.className = "goog-te-banner-frame skiptranslate";
    banner.style.setProperty("display", "block", "important");
    banner.style.setProperty("visibility", "visible", "important");
    document.body.append(banner);
    document.body.style.setProperty("top", "40px", "important");

    await new Promise((resolve) => setTimeout(resolve, 50));
    const bannerStyle = getComputedStyle(banner);
    const hidden = bannerStyle.display === "none" || bannerStyle.visibility === "hidden";
    const bodyTop = document.body.style.getPropertyValue("top");
    banner.remove();
    return { hidden, bodyTop };
  });

  expect(result.hidden).toBe(true);
  expect(result.bodyTop).toBe("0px");
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


test("all four culture articles load three credited in-body images without mobile overflow", async ({ page }) => {
  const articles = [
    "/zh-tw/culture/chinese-calligraphy/",
    "/zh-tw/culture/chinese-tea-culture/",
    "/zh-tw/culture/jingdezhen-blue-white-porcelain/",
    "/zh-tw/culture/traditional-chinese-courtyard/"
  ];

  for (const route of articles) {
    const response = await page.goto(route);
    expect(response?.status(), route + " should be available").toBe(200);
    const images = page.locator(".article-figure img");
    await expect(images).toHaveCount(3);
    await expect(page.locator(".article-figure figcaption a[href*='creativecommons.org']")).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute("alt", /.+/);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh-tw/culture/chinese-calligraphy/");
  const calligraphyImages = page.locator(".article-figure img");
  await expect(calligraphyImages).toHaveCount(3);
  await calligraphyImages.evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const articleLayout = await page.locator(".prose").evaluate((article) => {
    const rect = article.getBoundingClientRect();
    const images = [...article.querySelectorAll("img")].map((image) => {
      const imageRect = image.getBoundingClientRect();
      return {
        alt: image.alt,
        left: Math.round(imageRect.left),
        right: Math.round(imageRect.right),
        width: Math.round(imageRect.width)
      };
    });
    return {
      articleLeft: Math.round(rect.left),
      articleRight: Math.round(rect.right),
      articleWidth: article.clientWidth,
      articleScrollWidth: article.scrollWidth,
      images,
      imageOverflow: images.some((image) => image.left < -1 || image.right > window.innerWidth + 1)
    };
  });
  console.log("Mobile article layout inspection:", JSON.stringify(articleLayout));
  // The existing Google Translate widget is intentionally preserved; scope this
  // assertion to article content and its images rather than third-party UI.
  expect(articleLayout.articleLeft).toBeGreaterThanOrEqual(-1);
  expect(articleLayout.articleRight).toBeLessThanOrEqual(391);
  expect(articleLayout.articleScrollWidth).toBeLessThanOrEqual(articleLayout.articleWidth + 1);
  expect(articleLayout.imageOverflow).toBe(false);
});
