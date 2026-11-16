-- Remove the four interim culture guides that were mistakenly presented as
-- the requested book content. Their replacement is the five original books.
-- Delete child rows first; preserve the five source-book catalog records.
PRAGMA foreign_keys = ON;

DELETE FROM cms_submissions
WHERE content_id IN (
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1001',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1002',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1003',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1004'
);
DELETE FROM content_revisions
WHERE content_id IN (
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1001',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1002',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1003',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1004'
);
DELETE FROM content_variants
WHERE content_id IN (
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1001',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1002',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1003',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1004'
);
DELETE FROM content_items
WHERE content_id IN (
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1001',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1002',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1003',
  '4a1d7a52-6c5d-4d4c-9c8a-1f6d1a2b1004'
);
