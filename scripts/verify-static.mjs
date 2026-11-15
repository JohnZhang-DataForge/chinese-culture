import {existsSync,readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join,dirname} from "node:path";
import assert from "node:assert/strict";
const root=dirname(dirname(fileURLToPath(import.meta.url))),dist=join(root,"dist");
assert.ok(existsSync(dist),"Build output missing. Run npm run build.");
const pages=["","learn/","culture/","festivals/","books/","events/","about/","accessibility/","contact/","editorial-policy/","privacy/"];
for(const page of pages){const file=join(dist,"zh-tw",page,"index.html");assert.ok(existsSync(file),"Missing Traditional Chinese page "+page);const html=readFileSync(file,"utf8");assert.ok(html.includes('<html lang="zh-TW"'),"Wrong document language: "+file);assert.ok(!html.includes("images.unsplash.com"),"Old photo URL remains: "+file);}
const redirects=readFileSync(join(root,"public/_redirects"),"utf8");
assert.ok(redirects.startsWith("/ /zh-tw/ 301"),"Root must default to Traditional Chinese.");
for(const path of ["/en/* /zh-tw/:splat 301","/zh-cn/* /zh-tw/:splat 301","/es/* /zh-tw/:splat 301"])assert.ok(redirects.includes(path),"Missing legacy redirect "+path);
const sitemap=readFileSync(join(dist,"sitemap.xml"),"utf8");
assert.ok(sitemap.includes("https://chinese-culture.site/zh-tw/"),"Traditional Chinese home missing from sitemap.");
assert.ok(!/https:\/\/chinese-culture\.site\/(en|zh-cn|es)\//.test(sitemap),"Non-Traditional authored locale remains in sitemap.");
console.log("PASS: Traditional Chinese is the only authored locale; legacy paths redirect; old photos are absent.");
