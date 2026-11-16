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


-- Seed the five source-book records. Text and PDF binaries are imported separately.
INSERT OR IGNORE INTO book_catalog
(book_id,slug,locale,title,author,description,sort_order,source_filename,source_pdf_pages,source_pdf_size_bytes,cover_asset_path,content_status,rights_status,publication_status,created_at,updated_at)
VALUES
('a3b789f6-4903-4b5a-95ea-f7cb2a9ac03d','dao-de-jing-qian-yi','zh-TW','道德經淺易','杜素珍編註','杜素珍編註，以淺白文字、故事與生活例子，引導讀者閱讀《道德經》八十一章，認識道、德與無為的思想。',1,'【電子版】道德經淺易(3).pdf',324,15334148,'/books/dao-de-jing-qian-yi-cover.webp','pending_import','pending_review','draft','2026-11-16T09:00:00-05:00','2026-11-16T09:00:00-05:00'),
('54e4b3e8-3f9c-4ac5-a756-3ac84c4fee6c','lun-yu-qian-yi','zh-TW','論語淺易','杜素珍編註','杜素珍編註，依《論語》篇章整理孔子與弟子的言行，並以白話說明仁、禮、孝悌、修身與處世之道。',2,'【電子版】論語淺易(3).pdf',336,16524145,'/books/lun-yu-qian-yi-cover.webp','pending_import','pending_review','draft','2026-11-16T09:00:00-05:00','2026-11-16T09:00:00-05:00'),
('5c48f1a1-6578-46b2-9ffb-961a30afd2e8','da-xue-qian-yi','zh-TW','大學淺易',NULL,'依《大學證釋》原文及註解編寫，循明明德、親親新民、止於至善，以及格物、致知、誠意、正心、修身、齊家、治國、平天下的脈絡閱讀。',3,'【電子版】大學淺易(3).pdf',124,6378900,'/books/da-xue-qian-yi-cover.webp','pending_import','pending_review','draft','2026-11-16T09:00:00-05:00','2026-11-16T09:00:00-05:00'),
('602d60d3-f59e-44e7-9ca7-d783cc66a1fb','zhong-yong-qian-yi','zh-TW','中庸淺易','杜素珍編註','杜素珍編註，從性與教、至誠、鬼神之德、君子中庸與天道等主題，介紹《中庸》修身與處世的思想。',4,'512549294675591269_【電子書】《中庸淺易》(3).pdf',110,7851506,'/books/zhong-yong-qian-yi-cover.webp','pending_import','pending_review','draft','2026-11-16T09:00:00-05:00','2026-11-16T09:00:00-05:00'),
('6681b124-5679-46fa-bfa1-d2190f69eeaf','chu-xiu-dao-gan-yan','zh-TW','初修道感言','杜素珍著','杜素珍著，收錄修身、素食、健康、感恩、放生、自然啟示與修道生活等文章，呈現作者的個人感悟與生活分享。',5,'【電子版】初修道感言(3).pdf',160,9495827,'/books/chu-xiu-dao-gan-yan-cover.webp','pending_import','pending_review','draft','2026-11-16T09:00:00-05:00','2026-11-16T09:00:00-05:00');
