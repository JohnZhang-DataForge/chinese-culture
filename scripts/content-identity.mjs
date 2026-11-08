import { createHash } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function deterministicContentId(collection, slug) {
  const bytes = createHash("sha256").update(collection + "/" + slug).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export function resolveContentIdentity(metadata, expectedLocale, collection, slug, sourcePath = "content file") {
  if (metadata.locale !== undefined && metadata.locale !== expectedLocale) {
    throw new Error("Locale metadata mismatch in " + sourcePath + ": expected " + expectedLocale + ", received " + metadata.locale + ".");
  }
  const contentId = metadata.contentId === undefined
    ? deterministicContentId(collection, slug)
    : String(metadata.contentId).toLowerCase();
  if (!UUID_PATTERN.test(contentId)) {
    throw new Error("Invalid immutable contentId in " + sourcePath + ".");
  }
  return contentId;
}
