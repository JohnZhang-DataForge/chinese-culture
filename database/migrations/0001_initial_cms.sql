-- 0001_initial_cms.sql
-- Canonical editorial storage for Chinese Culture Atlas.
-- Public pages remain static; only authenticated Pages Functions access these tables.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS content_items (
  content_id TEXT PRIMARY KEY NOT NULL,
  collection TEXT NOT NULL CHECK (collection IN ('lessons', 'culture', 'festivals', 'books', 'events')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_variants (
  content_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh-CN')),
  collection TEXT NOT NULL CHECK (collection IN ('lessons', 'culture', 'festivals', 'books', 'events')),
  slug TEXT NOT NULL CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*' AND slug NOT GLOB '-*' AND slug NOT GLOB '*-'),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 500),
  seo_title TEXT,
  seo_description TEXT,
  category TEXT NOT NULL CHECK (length(trim(category)) BETWEEN 1 AND 100),
  body_markdown TEXT NOT NULL CHECK (length(body_markdown) <= 200000),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  updated_at TEXT NOT NULL,
  published_at TEXT,
  display_order REAL CHECK (display_order IS NULL OR display_order >= 0),
  reading_minutes INTEGER NOT NULL DEFAULT 5 CHECK (reading_minutes BETWEEN 1 AND 240),
  level TEXT,
  chinese TEXT,
  pinyin TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  sources_json TEXT NOT NULL DEFAULT '[]',
  media_json TEXT NOT NULL DEFAULT '[]',
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  last_mutation_id TEXT NOT NULL,
  PRIMARY KEY (content_id, locale),
  UNIQUE (collection, locale, slug),
  FOREIGN KEY (content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_content_variants_updated
  ON content_variants(updated_at DESC, content_id, locale);

CREATE INDEX IF NOT EXISTS idx_content_variants_collection_locale_status
  ON content_variants(collection, locale, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_variants_status_featured
  ON content_variants(status, featured, display_order);

CREATE TABLE IF NOT EXISTS content_revisions (
  revision_id TEXT PRIMARY KEY NOT NULL,
  content_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh-CN')),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  actor_email TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (content_id, locale, revision),
  FOREIGN KEY (content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_history
  ON content_revisions(content_id, locale, revision DESC);

CREATE TABLE IF NOT EXISTS cms_submissions (
  submission_id TEXT PRIMARY KEY NOT NULL,
  content_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh-CN')),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  intent TEXT NOT NULL CHECK (intent IN ('review', 'publish', 'unpublish')),
  branch TEXT,
  pr_number INTEGER,
  pr_url TEXT,
  pr_state TEXT NOT NULL DEFAULT 'pending' CHECK (pr_state IN ('pending', 'open', 'closed', 'merged', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  merged_at TEXT,
  FOREIGN KEY (content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_cms_submissions_content
  ON cms_submissions(content_id, locale, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_submissions_pr
  ON cms_submissions(pr_number, pr_state);
