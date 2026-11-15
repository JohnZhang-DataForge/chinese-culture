-- One authored language: Traditional Chinese (zh-TW).
-- Clear old articles, translations, revisions, submissions and their image references.
DELETE FROM cms_submissions;
DELETE FROM content_revisions;
DELETE FROM content_variants;
DELETE FROM content_items;
CREATE TABLE content_variants_new (
 content_id TEXT NOT NULL,locale TEXT NOT NULL CHECK(locale='zh-TW'),
 collection TEXT NOT NULL CHECK(collection IN ('lessons','culture','festivals','books','events')),
 slug TEXT NOT NULL CHECK(slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*' AND slug NOT GLOB '-*' AND slug NOT GLOB '*-' AND slug NOT LIKE '%--%'),
 title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 180),description TEXT NOT NULL CHECK(length(trim(description)) BETWEEN 1 AND 500),
 seo_title TEXT,seo_description TEXT,category TEXT NOT NULL CHECK(length(trim(category)) BETWEEN 1 AND 100),body_markdown TEXT NOT NULL CHECK(length(body_markdown)<=200000),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','unpublished')),featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
 updated_at TEXT NOT NULL,published_at TEXT,display_order REAL CHECK(display_order IS NULL OR display_order>=0),
 reading_minutes INTEGER NOT NULL DEFAULT 5 CHECK(reading_minutes BETWEEN 1 AND 240),level TEXT,chinese TEXT,pinyin TEXT,
 tags_json TEXT NOT NULL DEFAULT '[]',sources_json TEXT NOT NULL DEFAULT '[]',media_json TEXT NOT NULL DEFAULT '[]',
 image_url TEXT,image_alt TEXT,source_path TEXT,revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>=1),last_mutation_id TEXT NOT NULL,
 PRIMARY KEY(content_id,locale),UNIQUE(collection,locale,slug),
 FOREIGN KEY(content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
 CHECK(status<>'published' OR published_at IS NOT NULL)
);
INSERT INTO content_variants_new SELECT * FROM content_variants;
DROP TABLE content_variants;
ALTER TABLE content_variants_new RENAME TO content_variants;
CREATE INDEX idx_content_variants_updated ON content_variants(updated_at DESC,content_id,locale);
CREATE INDEX idx_content_variants_collection_locale_status ON content_variants(collection,locale,status,updated_at DESC);
CREATE INDEX idx_content_variants_status_featured ON content_variants(status,featured,display_order);
CREATE TABLE content_revisions_new (
 revision_id TEXT PRIMARY KEY NOT NULL,content_id TEXT NOT NULL,locale TEXT NOT NULL CHECK(locale='zh-TW'),
 revision INTEGER NOT NULL CHECK(revision>=1),actor_email TEXT NOT NULL,snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL,
 UNIQUE(content_id,locale,revision),FOREIGN KEY(content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);
INSERT INTO content_revisions_new SELECT * FROM content_revisions;
DROP TABLE content_revisions;
ALTER TABLE content_revisions_new RENAME TO content_revisions;
CREATE INDEX idx_content_revisions_history ON content_revisions(content_id,locale,revision DESC);
CREATE TABLE cms_submissions_new (
 submission_id TEXT PRIMARY KEY NOT NULL,content_id TEXT NOT NULL,locale TEXT NOT NULL CHECK(locale='zh-TW'),
 revision INTEGER NOT NULL CHECK(revision>=1),intent TEXT NOT NULL CHECK(intent IN ('review','publish','unpublish','media')),
 branch TEXT,pr_number INTEGER,pr_url TEXT,snapshot_json TEXT,pr_state TEXT NOT NULL DEFAULT 'pending' CHECK(pr_state IN ('pending','open','closed','merged','failed')),
 created_at TEXT NOT NULL,updated_at TEXT NOT NULL,merged_at TEXT,
 FOREIGN KEY(content_id) REFERENCES content_items(content_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);
INSERT INTO cms_submissions_new SELECT * FROM cms_submissions;
DROP TABLE cms_submissions;
ALTER TABLE cms_submissions_new RENAME TO cms_submissions;
CREATE INDEX idx_cms_submissions_content ON cms_submissions(content_id,locale,created_at DESC);
CREATE INDEX idx_cms_submissions_pr ON cms_submissions(pr_number,pr_state);
