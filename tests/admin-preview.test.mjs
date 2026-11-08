import test from "node:test";
import assert from "node:assert/strict";
import { renderSafePreview } from "../functions/_lib/preview.js";

test("preview renders headings, paragraphs, lists and safe HTTPS links", () => {
  const html = renderSafePreview({
    locale: "es",
    title: "Una cultura viva",
    description: "Una introducción breve.",
    category: "Cultura",
    bodyMarkdown: "## Tradiciones\n\nUna **historia** y [una fuente](https://example.org/story).\n\n- Uno\n- Dos"
  });
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<h2>Tradiciones<\/h2>/);
  assert.match(html, /<strong>historia<\/strong>/);
  assert.match(html, /href="https:\/\/example\.org\/story"/);
  assert.match(html, /<ul>[\s\S]*<li>Uno<\/li>[\s\S]*<li>Dos<\/li>[\s\S]*<\/ul>/);
});

test("preview escapes HTML and does not allow script or javascript URL injection", () => {
  const html = renderSafePreview({
    locale: "en",
    title: "<img src=x onerror=alert(1)>",
    description: "safe",
    category: "Test",
    bodyMarkdown: "<script>alert(1)</script> [click](javascript:alert(1))"
  });
  assert.doesNotMatch(html, /<script>/i);
  assert.doesNotMatch(html, /<img src=x/i);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /href="javascript:/i);
});
