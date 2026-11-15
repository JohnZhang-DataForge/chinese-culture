import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import assert from "node:assert/strict";
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dist=join(root,"dist");
assert.ok(existsSync(dist),"Build output missing. Run npm run build.");
const locales=[{slug:"zh-tw",lang:"zh-TW",label:"繁體中文"},{slug:"en",lang:"en",label:"English"},{slug:"zh-cn",lang:"zh-CN",label:"简体中文"},{slug:"es",lang:"es",label:"Español"}];
const pages=["","learn/","culture/","festivals/","books/","events/","about/","accessibility/","contact/","editorial-policy/","privacy/"];
for(const locale of locales)for(const page of pages){
 const file=join(dist,locale.slug,page,"index.html");assert.ok(existsSync(file),"Missing "+locale.slug+"/"+page);
 const html=readFileSync(file,"utf8");assert.ok(html.includes('<html lang="'+locale.lang+'"'),"Wrong lang in "+file);
 assert.ok(html.includes(locale.label),"Missing locale selector label in "+file);
 assert.ok(!html.includes("images.unsplash.com")&&!/<img\\b/i.test(html),"Legacy photo rendered in "+file);
}
const redirects=readFileSync(join(root,"public/_redirects"),"utf8");
assert.ok(redirects.startsWith("/ /zh-tw/ 301"),"Root must redirect to Traditional Chinese.");
const sitemap=readFileSync(join(dist,"sitemap.xml"),"utf8");
assert.ok(sitemap.includes("https://chinese-culture.site/zh-tw/"),"Traditional Chinese home missing from sitemap.");
assert.ok(!existsSync(join(dist,"_worker.js")),"Static site must not emit an SSR Worker.");
const wrangler=readFileSync(join(root,"wrangler.jsonc"),"utf8");
assert.ok(wrangler.includes('"pages_build_output_dir": "./dist"'),"Wrong Pages output directory.");
assert.ok(wrangler.includes('"name": "chinese-culture"'),"Wrong Pages project name.");
console.log("PASS: four locale routes, Traditional Chinese default, empty article inventory, no old photos.");
