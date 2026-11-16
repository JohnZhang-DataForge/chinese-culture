import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articles = [
  "chinese-calligraphy",
  "chinese-tea-culture",
  "jingdezhen-blue-white-porcelain",
  "traditional-chinese-courtyard"
];

test("each Traditional Chinese culture article has three credited in-body editorial images", async () => {
  for (const slug of articles) {
    const source = await readFile(new URL(`../src/content/zh-tw/culture/${slug}.md`, import.meta.url), "utf8");
    const figures = [...source.matchAll(/<figure class="article-figure(?: [^"]*)?">([\s\S]*?)<\/figure>/g)];
    assert.equal(figures.length, 3, `${slug} should contain exactly three in-body images`);
    for (const [index, figure] of figures.entries()) {
      const block = figure[1];
      const image = /<img\s+([^>]+)>/.exec(block)?.[1] ?? "";
      assert.match(image, /\bsrc="https:\/\//, `${slug} image ${index + 1} needs an HTTPS URL`);
      assert.match(image, /\balt="[^"]{8,}"/, `${slug} image ${index + 1} needs descriptive alt text`);
      assert.match(image, /\bloading="lazy"/, `${slug} image ${index + 1} should lazy-load`);
      const caption = /<figcaption>([\s\S]*?)<\/figcaption>/.exec(block)?.[1] ?? "";
      assert.ok(caption.length > 35, `${slug} image ${index + 1} needs a meaningful caption and credit`);
      assert.match(caption, /Wikimedia Commons/);
      assert.match(caption, /href="https:\/\/creativecommons\.org\/(?:licenses|publicdomain)\//, `${slug} image ${index + 1} needs a license link`);
      assert.match(caption, /href="https:\/\/commons\.wikimedia\.org\/wiki\/File:/, `${slug} image ${index + 1} needs a source link`);
    }
  }
});
