import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const supersededGuides = [
  "chinese-calligraphy.md",
  "chinese-tea-culture.md",
  "jingdezhen-blue-white-porcelain.md",
  "traditional-chinese-courtyard.md"
];

test("superseded culture guides are no longer public articles", () => {
  for (const filename of supersededGuides) {
    assert.equal(
      existsSync(new URL("../src/content/zh-tw/culture/" + filename, import.meta.url)),
      false,
      filename + " must be removed from the public content collection"
    );
  }
});
