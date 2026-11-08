import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import assert from "node:assert/strict";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const required = [
  "index.html","learn/index.html","culture/index.html",
  "festivals/index.html","books/index.html","events/index.html",
  "about/index.html","contact/index.html","privacy/index.html",
  "accessibility/index.html","editorial-policy/index.html",
  "en/index.html","zh-cn/index.html","es/index.html",
  "en/learn/index.html","en/culture/index.html","en/festivals/index.html","en/books/index.html","en/events/index.html",
  "en/about/index.html","en/accessibility/index.html","en/contact/index.html","en/editorial-policy/index.html","en/privacy/index.html",
  "zh-cn/learn/index.html","zh-cn/culture/index.html","zh-cn/festivals/index.html","zh-cn/books/index.html","zh-cn/events/index.html",
  "es/learn/index.html","es/culture/index.html","es/festivals/index.html","es/books/index.html","es/events/index.html",
  "zh-cn/about/index.html","zh-cn/accessibility/index.html","zh-cn/contact/index.html","zh-cn/editorial-policy/index.html","zh-cn/privacy/index.html",
  "es/about/index.html","es/accessibility/index.html","es/contact/index.html","es/editorial-policy/index.html","es/privacy/index.html","en/learn/01-a-living-culture/index.html","en/learn/02-language-and-writing/index.html","en/learn/03-festivals-and-calendars/index.html","en/learn/04-art-of-the-brush/index.html","en/learn/05-stories-and-reading/index.html","en/culture/calligraphy-and-the-brush/index.html","en/culture/family-tables-and-hospitality/index.html","en/culture/reading-a-painting/index.html","en/festivals/dragon-boat-festival/index.html","en/festivals/mid-autumn-festival/index.html","en/festivals/spring-festival/index.html","en/books/journey-to-the-west/index.html","en/books/the-analects/index.html","zh-cn/learn/01-a-living-culture/index.html","es/learn/01-a-living-culture/index.html","zh-cn/learn/02-language-and-writing/index.html","es/learn/02-language-and-writing/index.html","zh-cn/learn/03-festivals-and-calendars/index.html","es/learn/03-festivals-and-calendars/index.html","zh-cn/learn/04-art-of-the-brush/index.html","es/learn/04-art-of-the-brush/index.html","zh-cn/learn/05-stories-and-reading/index.html","es/learn/05-stories-and-reading/index.html","zh-cn/culture/calligraphy-and-the-brush/index.html","es/culture/calligraphy-and-the-brush/index.html","zh-cn/culture/family-tables-and-hospitality/index.html","es/culture/family-tables-and-hospitality/index.html","zh-cn/culture/reading-a-painting/index.html","es/culture/reading-a-painting/index.html","zh-cn/festivals/dragon-boat-festival/index.html","es/festivals/dragon-boat-festival/index.html","zh-cn/festivals/mid-autumn-festival/index.html","es/festivals/mid-autumn-festival/index.html","zh-cn/festivals/spring-festival/index.html","es/festivals/spring-festival/index.html","zh-cn/books/journey-to-the-west/index.html","es/books/journey-to-the-west/index.html","zh-cn/books/the-analects/index.html","es/books/the-analects/index.html","404.html"
];
assert.ok(existsSync(dist), "Build output missing. Run npm run build.");
for (const path of required) assert.ok(existsSync(join(dist,path)), "Missing page " + path);
assert.ok(!existsSync(join(dist,"_worker.js")), "Detected SSR Worker output; must remain static.");
const wrangler = readFileSync(join(root,"wrangler.jsonc"),"utf8");
assert.ok(wrangler.includes('"pages_build_output_dir": "./dist"'), "Wrong Pages build output directory");
assert.ok(wrangler.includes('"name": "chinese-culture"'), "Wrong Pages project name");
assert.ok(!/"main"\s*:/.test(wrangler), "Unexpected Worker entrypoint");
let count=0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path=join(dir,name);
    if(statSync(path).isDirectory()) walk(path);
    else {count++;assert.ok(statSync(path).size<=25*1024*1024, "Asset too large: "+path);}
  }
}
walk(dist);
assert.ok(count<=20000, "Exceeds Cloudflare Pages Free file count");

const homeHtml = readFileSync(join(dist,"index.html"),"utf8");
assert.ok(homeHtml.includes("Chinese Culture Atlas"), "Missing home page brand");
const englishHome = readFileSync(join(dist,"en/index.html"),"utf8");
const chineseHome = readFileSync(join(dist,"zh-cn/index.html"),"utf8");
const spanishHome = readFileSync(join(dist,"es/index.html"),"utf8");
assert.ok(chineseHome.includes('<html lang="zh-CN"'), "Chinese home page must declare zh-CN");
assert.ok(spanishHome.includes('<html lang="es"'), "Spanish home page must declare es");
assert.ok(englishHome.includes('<html lang="en"'), "English home page must declare en");
assert.ok(chineseHome.includes("简体中文") && spanishHome.includes("Español"), "Language selector must expose Chinese and Spanish");
assert.ok(englishHome.includes('href="/zh-cn/"') && chineseHome.includes('href="/es/"') && spanishHome.includes('href="/en/"'), "Language selector must link to same-domain locale home pages");

let linksChecked = 0;
let htmlPagesChecked = 0;
function inspectLinks(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) { inspectLinks(file); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(file, "utf8");
    htmlPagesChecked++;
    const relativePath = file.slice(dist.length + 1).replaceAll("\\", "/");
    // The private Admin workspace is intentionally an interactive static shell;
    // its native controls are hydrated by the authenticated same-origin API.
    if (relativePath !== "admin/index.html") {
      assert.ok(!/<(?:form|input|select|textarea|option)\b/i.test(html), "Unexpected native form control in static output: " + file);
    }
    for (const fragment of html.replaceAll("href='", 'href="').split('href="').slice(1)) {
      const href = fragment.split('"')[0];
      if (!href.startsWith("/")) continue;
      const pathname = decodeURIComponent(href.split("?")[0].split("#")[0]);
      if (!pathname) continue;
      const destination = pathname.endsWith("/")
        ? join(dist, pathname, "index.html")
        : join(dist, pathname);
      assert.ok(existsSync(destination), "Broken internal link from " + file + ": " + pathname);
      linksChecked++;
    }
  }
}
inspectLinks(dist);
const entryDirs = ["learn","culture","festivals","books"].reduce((total,section)=>{
  const folder=join(dist,section);
  return total+readdirSync(folder,{withFileTypes:true}).filter((entry)=>entry.isDirectory()).length;
},0);
assert.ok(linksChecked >= 50, 'Expected internal links were not inspected');
assert.ok(entryDirs>=13, "Expected at least 13 educational content pages");
console.log("PASS: "+required.length+" required routes, "+entryDirs+" English guides, "+count+" static files, "+htmlPagesChecked+" HTML pages, "+linksChecked+" internal links, English/Chinese/Spanish localization routes present, no SSR Worker.");
