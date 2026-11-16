-- 0004_book_library.sql
-- Structured storage for the five source books. Full text is stored by section
-- so long chapters can be searched and rendered without a single oversized CMS body.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS book_catalog (
  book_id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'zh-TW' CHECK (locale = 'zh-TW'),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
  author TEXT,
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 500),
  sort_order INTEGER NOT NULL CHECK (sort_order BETWEEN 1 AND 100),
  source_filename TEXT NOT NULL,
  source_pdf_pages INTEGER NOT NULL CHECK (source_pdf_pages > 0),
  source_pdf_size_bytes INTEGER NOT NULL CHECK (source_pdf_size_bytes > 0),
  cover_asset_path TEXT,
  content_status TEXT NOT NULL DEFAULT 'pending_import'
    CHECK (content_status IN ('pending_import','text_imported','verified')),
  rights_status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (rights_status IN ('pending_review','approved','restricted')),
  publication_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft','published','unpublished')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS book_sections (
  section_id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  section_order INTEGER NOT NULL CHECK (section_order >= 0),
  section_type TEXT NOT NULL CHECK (section_type IN ('preface','contents','chapter','appendix','other')),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
  body_markdown TEXT NOT NULL DEFAULT '',
  source_page_start INTEGER,
  source_page_end INTEGER,
  UNIQUE (book_id, section_order),
  FOREIGN KEY (book_id) REFERENCES book_catalog(book_id) ON UPDATE RESTRICT ON DELETE CASCADE,
  CHECK (source_page_start IS NULL OR source_page_start > 0),
  CHECK (source_page_end IS NULL OR source_page_end >= source_page_start)
);

CREATE INDEX IF NOT EXISTS idx_book_catalog_publication
  ON book_catalog(locale, publication_status, sort_order);

CREATE INDEX IF NOT EXISTS idx_book_sections_order
  ON book_sections(book_id, section_order);

