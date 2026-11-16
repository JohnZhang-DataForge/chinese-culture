import {existsSync,readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join,dirname} from "node:path";
import assert from "node:assert/strict";
const root=dirname(dirname(fileURLToPath(import.meta.url))),dist=join(root,"dist");
assert.ok(existsSync(dist),"Build output missing. Run npm run build.");
const pages=["","learn/","culture/","festivals/","books/","events/","about/","accessibility/","contact/","editorial-policy/","privacy/"];
for(const page of pages){const file=join(dist,"zh-tw",page,"index.html");assert.ok(existsSync(file),"Missing Traditional Chinese page "+page);const html=readFileSync(file,"utf8");assert.ok(html.includes('<html lang="zh-TW"'),"Wrong document language: "+file);assert.ok(!html.includes("images.unsplash.com"),"Old photo URL remains: "+file);}
const culturePage=readFileSync(join(dist,"zh-tw","culture","index.html"),"utf8");
for(const slug of ["chinese-calligraphy","chinese-tea-culture","jingdezhen-blue-white-porcelain","traditional-chinese-courtyard"]) {
  assert.ok(!existsSync(join(dist,"zh-tw","culture",slug,"index.html")),"Superseded culture article still published: "+slug);
  assert.ok(!culturePage.includes("/zh-tw/culture/"+slug+"/"),"Superseded culture article remains linked: "+slug);
}
const booksPage=readFileSync(join(dist,"zh-tw","books","index.html"),"utf8");
const books=[
  ["dao-de-jing-qian-yi","道德經淺易"],
  ["lun-yu-qian-yi","論語淺易"],
  ["da-xue-qian-yi","大學淺易"],
  ["zhong-yong-qian-yi","中庸淺易"],
  ["chu-xiu-dao-gan-yan","初修道感言"]
];
for(const [slug,title] of books){
  assert.ok(existsSync(join(dist,"assets","books",slug+"-cover.webp")),"Missing original book cover asset: "+slug);
  const file=join(dist,"zh-tw","books",slug,"index.html");
  assert.ok(existsSync(file),"Missing source-book reading page: "+slug);
  const html=readFileSync(file,"utf8");
  assert.ok(html.includes(title),"Book title missing: "+title);
  assert.ok(html.length>12000,"Book source text is unexpectedly short: "+slug);
  assert.ok(booksPage.includes("/zh-tw/books/"+slug+"/"),"Book missing from collection: "+slug);
}

const redirects=readFileSync(join(root,"public/_redirects"),"utf8");
const unifiedBooks=booksPage;
for(const [slug,title] of books){
  assert.ok(unifiedBooks.includes('id="'+slug+'"'),"Unified book anchor missing: "+slug);
  assert.ok(unifiedBooks.includes(title),"Unified book title missing: "+title);
  assert.ok(unifiedBooks.includes('/assets/books/illustrations/'+({ "dao-de-jing-qian-yi":"dao-de-jing.svg","lun-yu-qian-yi":"lun-yu.svg","da-xue-qian-yi":"da-xue.svg","zhong-yong-qian-yi":"zhong-yong.svg","chu-xiu-dao-gan-yan":"chu-xiu-dao-gan-yan.svg" }[slug])),"Book illustration missing: "+slug);
}
assert.equal((unifiedBooks.match(/data-slide(?:\\s|>)/g)||[]).length,5,"Carousel must contain exactly five slides.");
assert.equal((unifiedBooks.match(/data-dot(?:\\s|>)/g)||[]).length,5,"Carousel must contain exactly five indicators.");
assert.ok(unifiedBooks.includes("setInterval") && unifiedBooks.includes("6000"),"Carousel auto-rotation timer missing.");
assert.ok(unifiedBooks.includes("prefers-reduced-motion"),"Carousel must respect reduced-motion preference.");
assert.ok(unifiedBooks.includes("data-chapters"),"Chapter navigation generation missing.");
const bookIllustrations=["books-hero.svg","dao-de-jing.svg","lun-yu.svg","da-xue.svg","zhong-yong.svg","chu-xiu-dao-gan-yan.svg"];
for(const illustration of bookIllustrations)assert.ok(existsSync(join(root,"public","assets","books","illustrations",illustration)),"Missing illustration "+illustration);
for(const slug of books.map(([slug])=>slug)){
  assert.ok(redirects.includes("/zh-tw/books/"+slug+"/ /zh-tw/books/#"+slug+" 301"),"Missing legacy book anchor redirect: "+slug);
}
\nconst translateComponent=readFileSync(join(root,"src/components/GoogleTranslate.astro"),"utf8");
assert.ok(translateComponent.includes("InlineLayout.HORIZONTAL"),"Google Translate must use the native horizontal dropdown.");
assert.ok(!translateComponent.includes("InlineLayout.SIMPLE"),"Google Translate must not use the expanded Simple language panel.");
assert.ok(redirects.startsWith("/ /zh-tw/ 301"),"Root must default to Traditional Chinese.");
for(const path of ["/en/* /zh-tw/:splat 301","/zh-cn/* /zh-tw/:splat 301","/es/* /zh-tw/:splat 301"])assert.ok(redirects.includes(path),"Missing legacy redirect "+path);
const sitemap=readFileSync(join(dist,"sitemap.xml"),"utf8");
assert.ok(sitemap.includes("https://chinese-culture.site/zh-tw/"),"Traditional Chinese home missing from sitemap.");
assert.ok(!/https:\/\/chinese-culture\.site\/(en|zh-cn|es)\//.test(sitemap),"Non-Traditional authored locale remains in sitemap.");
console.log("PASS: Traditional Chinese is the only authored locale; five source books are published; superseded culture guides are absent; legacy paths redirect.");
