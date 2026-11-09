import test from "node:test";
import assert from "node:assert/strict";
import { matchesImageSignature, parseMetadata } from "../functions/api/admin/v1/content/[contentId]/media.js";

test("image signature validation accepts supported JPEG, PNG, WebP and AVIF headers", () => {
  assert.equal(matchesImageSignature(Uint8Array.of(0xff, 0xd8, 0xff, 0x00), "image/jpeg"), true);
  assert.equal(matchesImageSignature(Uint8Array.of(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a), "image/png"), true);
  assert.equal(matchesImageSignature(new TextEncoder().encode("RIFFxxxxWEBP"), "image/webp"), true);
  assert.equal(matchesImageSignature(new TextEncoder().encode("xxxxftypavif"), "image/avif"), true);
});

test("image signature validation rejects mismatched and truncated payloads", () => {
  assert.equal(matchesImageSignature(new TextEncoder().encode("<svg/>"), "image/png"), false);
  assert.equal(matchesImageSignature(Uint8Array.of(0xff, 0xd8), "image/jpeg"), false);
  assert.equal(matchesImageSignature(new TextEncoder().encode("RIFFxxxxJPEG"), "image/webp"), false);
  assert.equal(matchesImageSignature(new TextEncoder().encode("xxxxftypmif1"), "image/avif"), false);
});

test("media metadata requires accessible alt text, credit and license", () => {
  assert.deepEqual(parseMetadata({
    alt: "A red paper lantern",
    credit: "Original photography",
    license: "CC BY 4.0",
    sourceUrl: "https://example.org/image"
  }), {
    alt: "A red paper lantern",
    credit: "Original photography",
    license: "CC BY 4.0",
    sourceUrl: "https://example.org/image"
  });
});

test("media metadata rejects missing fields, overlong alt text and non-HTTPS sources", () => {
  assert.throws(() => parseMetadata({ alt: "", credit: "Credit", license: "Original" }), (error) => error.code === "invalid_media_alt");
  assert.throws(() => parseMetadata({ alt: "Alt", credit: "", license: "Original" }), (error) => error.code === "invalid_media_credit");
  assert.throws(() => parseMetadata({ alt: "Alt", credit: "Credit", license: "" }), (error) => error.code === "invalid_media_license");
  assert.throws(() => parseMetadata({ alt: "x".repeat(301), credit: "Credit", license: "Original" }), (error) => error.code === "invalid_media_alt");
  assert.throws(() => parseMetadata({ alt: "Alt", credit: "Credit", license: "Original", sourceUrl: "http://example.org/image" }), (error) => error.code === "invalid_media_source");
  assert.throws(() => parseMetadata("not-json"), (error) => error.code === "invalid_media_metadata");
});
