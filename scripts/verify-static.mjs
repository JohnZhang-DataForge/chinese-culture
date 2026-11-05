import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import assert from "node:assert/strict";
import {
  GOOGLE_TRANSLATE_LANGUAGES,
  buildGoogleTranslateUrl
} from "../src/lib/google-translate-url.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const required = [
  "index.html","learn/index.html","culture/index.html",
  "festivals/index.html","books/index.html","events/index.html",
  "about/index.html","contact/index.html","privacy/index.html",
  "accessibility/index.html","editorial-policy/index.html","404.html"
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

const samplePageUrl = "https://chinese-culture.site/culture/calligraphy/?topic=brush#history";
const googleUrl = new URL(buildGoogleTranslateUrl(samplePageUrl, "ja"));
assert.equal(googleUrl.origin, "https://chinese--culture-site.translate.goog", "Hyphenated source hostname must be encoded for translate.goog");
assert.equal(googleUrl.pathname, "/culture/calligraphy/", "Current page path must be preserved");
assert.equal(googleUrl.searchParams.get("topic"), "brush", "Original query parameters must be preserved");
assert.equal(googleUrl.hash, "#history", "Current page fragment must be preserved");
assert.equal(googleUrl.searchParams.get("_x_tr_sl"), "auto", "Source language must be auto-detected");
assert.equal(googleUrl.searchParams.get("_x_tr_tl"), "ja", "Target language must be retained");
assert.equal(googleUrl.searchParams.get("_x_tr_hl"), "en", "Google Translate interface language must be English");
assert.equal(googleUrl.searchParams.get("_x_tr_pto"), "wapp", "Google Translate web-app mode must be enabled");
assert.equal(googleUrl.searchParams.has("text"), false, "Do not pass the URL as text to the Translate input field");
assert.equal(googleUrl.searchParams.has("op"), false, "Do not redirect to the empty Translate UI");

const wwwUrl = new URL(buildGoogleTranslateUrl("https://www.example.com/about", "ca"));
assert.equal(wwwUrl.hostname, "www-example-com.translate.goog", "Dots in hostnames must map to hyphens");

const dashedHostUrl = new URL(buildGoogleTranslateUrl("https://foo-bar.example.com/", "es"));
assert.equal(dashedHostUrl.hostname, "foo--bar-example-com.translate.goog", "Literal hostname hyphens must be doubled");

assert.throws(() => buildGoogleTranslateUrl(samplePageUrl, "not-a-language"), RangeError);
assert.throws(() => buildGoogleTranslateUrl("javascript:alert(1)", "es"), TypeError);
assert.throws(() => buildGoogleTranslateUrl("http://localhost:4321/", "es"), TypeError);
const languageCodes = GOOGLE_TRANSLATE_LANGUAGES.map(({ code }) => code);
assert.ok(languageCodes.length >= 40, "Expected a broad set of target languages");
assert.equal(new Set(languageCodes).size, languageCodes.length, "Duplicate target language code");

const homeHtml = readFileSync(join(dist,"index.html"),"utf8");
assert.ok(homeHtml.includes("Chinese Culture Atlas"), "Missing home page brand");
assert.ok(homeHtml.includes('id="google-translate-language"'), "Missing Google Translate language selector");
assert.ok(homeHtml.includes("Select Language"), "Missing selector placeholder");
assert.ok(homeHtml.includes("Powered by"), "Missing Google Translate attribution");
assert.ok(homeHtml.includes("Google</span> Translate"), "Missing Google Translate attribution text");

const componentSource = readFileSync(join(root,"src/components/GoogleTranslate.astro"),"utf8");
assert.ok(!componentSource.includes("translate_a/element.js"), "Retired Google Website Translator script must not be loaded");
assert.ok(!componentSource.includes("google.translate.TranslateElement"), "Retired Google Website Translator API must not be used");

let linksChecked = 0;
function inspectLinks(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) { inspectLinks(file); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(file, "utf8");
    assert.ok(html.includes('id="google-translate-language"'), "Missing Google Translate selector in " + file);
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
console.log("PASS: "+required.length+" routes, "+entryDirs+" guides, "+count+" static files, "+linksChecked+" internal links, direct Google Translate site URL verified, no legacy widget or SSR Worker.");
