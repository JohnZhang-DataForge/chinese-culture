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

test("one unified reading page contains all five complete books, original covers and attributed illustrations", async ({ page }) => {
  const response = await page.goto("/zh-tw/books/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-slide]")).toHaveCount(5);
  await expect(page.locator("[data-dot]")).toHaveCount(5);
  const illustrationNames = ["dao-de-jing.svg","lun-yu.svg","da-xue.svg","zhong-yong.svg","chu-xiu-dao-gan-yan.svg"];
  for (let index = 0; index < books.length; index += 1) {
    const [slug,title] = books[index];
    const section = page.locator(".book#" + slug);
    await expect(section).toBeAttached();
    await expect(section.locator("h2").first()).toHaveText(title);
    const prose = section.locator(".prose");
    expect((await prose.innerText()).length,title+" must retain the available source text").toBeGreaterThan(10000);
    const cover = section.locator(".book-cover");
    await cover.scrollIntoViewIfNeeded();
    await expect(cover).toHaveAttribute("alt",/原書封面/);
    const coverUrl = await cover.getAttribute("src");
    const coverResponse = await page.request.get(new URL(coverUrl,page.url()).toString());
    expect(coverResponse.status()).toBe(200);
    await expect.poll(()=>cover.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    const illustration = section.locator("figure img");
    await illustration.scrollIntoViewIfNeeded();
    await expect(illustration).toHaveAttribute("alt",/原創文化編輯插畫/);
    const illustrationUrl = await illustration.getAttribute("src");
    const illustrationResponse = await page.request.get(new URL(illustrationUrl,page.url()).toString());
    expect(illustrationResponse.status()).toBe(200);
    expect(illustrationResponse.headers()["content-type"]).toContain("image/svg+xml");
    await expect.poll(()=>illustration.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    await expect(section.locator("figcaption")).toContainText("原創編輯插畫");
    await expect(section.locator("[data-chapters]")).toBeAttached();
  }
});

test("carousel rotates, supports manual controls, and stops for reduced motion", async ({ page }) => {
  await page.goto("/zh-tw/books/");
  const track = page.locator("[data-track]");
  await expect(track).toHaveCSS("transform",/matrix/);
  const initial = await track.evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(6200);
  const rotated = await track.evaluate(el=>getComputedStyle(el).transform);
  expect(rotated).not.toBe(initial);
  await page.locator("[data-next]").click();
  const manual = await track.evaluate(el=>getComputedStyle(el).transform);
  expect(manual).not.toBe(rotated);
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.reload();
  const reducedInitial = await track.evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(6200);
  const reducedAfter = await page.locator("[data-track]").evaluate(el=>getComputedStyle(el).transform);
  expect(reducedAfter).toBe(reducedInitial);
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

test("unified book page and sticky book navigation fit a mobile viewport", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/zh-tw/books/");
  const diagnostic=await page.evaluate(()=>{const width=document.documentElement.clientWidth;return [...document.querySelectorAll("body *")].filter(el=>!el.closest(".viewport")).map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:typeof el.className==="string"?el.className:"",id:el.id,left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}}).filter(x=>x.width>0&&(x.right>width+1||x.left< -1)).sort((a,b)=>b.right-a.right).slice(0,25)});
  console.log("Mobile horizontal overflow elements",JSON.stringify(diagnostic));
  const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width+1);
  for(const [slug] of books){
    const section=page.locator(".book#"+slug);
    await expect(section).toBeAttached();
    const box=await section.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,right:Math.round(el.getBoundingClientRect().right)}));
    expect(box.scrollWidth).toBeLessThanOrEqual(box.width+1);
    expect(box.right).toBeLessThanOrEqual(391);
  }
});

test("legacy individual book URLs redirect to their matching unified page anchors", async ({page})=>{
  for(const [slug] of books){
    const response=await page.goto("/zh-tw/books/"+slug+"/");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/zh-tw/books/");
    expect(new URL(page.url()).hash).toBe("#"+slug);
  }
});
