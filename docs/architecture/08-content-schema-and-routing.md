# Content Schema, Routing and Author Workflow

**Status:** Static public routing implemented; D1 editorial schema and API contract versioned · **Updated:** 2026-11-09

## Source of truth

Cloudflare D1 (`CMS_DB`) is the canonical editorial store. Each article has one immutable `contentId` and one authored locale variant: Traditional Chinese (`zh-TW`). D1 stores content, media metadata, revision history and publication submissions.

Markdown files on `main` are static publication snapshots generated from approved D1 revisions. Public Astro pages are built from these files and never query D1 at request time.

## Locale-specific snapshot paths

- Traditional Chinese only: `src/content/zh-tw/{collection}/{slug}.md`

Collections currently supported by the CMS publisher are `lessons`, `culture`, `festivals` and `books`. The `events` page is not yet a CMS-published collection.

## Snapshot frontmatter

| Field | Required? | Type | Meaning |
|---|---|---|---|
| `title` | Yes | string | Reader-facing name and browser title |
| `description` | Yes | string | Introductory summary and SEO description |
| `category` | Yes | string | Section descriptor displayed above title |
| `chinese` | No | string | Chinese characters shown with language annotation |
| `pinyin` | No | string | Pronunciation metadata |
| `level` | No | string | e.g. Beginner |
| `order` | No | number | Learning sequence |
| `readingMinutes` | No | positive integer | Estimated time, default 5 |
| `featured` | No | boolean | Editorial feature flag |
| `image` | No | absolute HTTPS URL | Existing or reviewed media cover image |
| `imageAlt` | No | string | Cover image alternative text |

The full D1 model, immutable revision rules, locale contract, legacy image exception and media rights metadata are defined in [CC-CONTENT-001 v1.2.0](../openspec/contracts/content-schema.md).

## Publication lifecycle

1. Admin saves drafts and locale variants to D1.
2. Preview is generated server-side from the exact D1 content and escapes untrusted HTML.
3. Media uploads create a media-only GitHub PR; D1 attaches media metadata only after that PR merges.
4. Review requests create non-public snapshots under `content-reviews/`.
5. Publish creates a PR that adds/updates the locale Markdown snapshot. Unpublish creates a PR that removes the snapshot.
6. A human reviews and merges the PR. The CMS never auto-merges or writes directly to `main`.
7. The admin workspace checks PR state and uses an explicit CSRF-protected POST to synchronize merged status into D1, recording a new immutable revision.
8. The normal Pages deployment rebuilds the public static site from `main`.

## Adding or changing content

Normal editorial changes should use the Admin workspace. Direct Markdown edits are reserved for migration/bootstrap and reviewed engineering corrections. Any manual change to a generated snapshot must be reconciled with D1 before further CMS edits.

## Editorial quality

Traditional Chinese is the only authored source language. Visitors may use the in-page Google Translate widget for machine translation; machine output is not treated as an editorially reviewed language edition.


## Dedicated source-book library (D1)

The five original Traditional Chinese books use the dedicated `book_catalog` and `book_sections` tables, separate from the general CMS article variants:

- `book_catalog` stores the stable book identity, reading order, source PDF filename/page count/byte size, cover asset key, content-import status, rights-review status, and publication status.
- `book_sections` stores ordered prefaces, tables of contents, chapters, appendices, and their Markdown text, with optional source PDF page ranges.
- The catalog is seeded as draft-only. The initial records intentionally use `content_status='pending_import'` and `rights_status='pending_review'`; no book is publicly published by this schema migration.
- Original PDFs are tracked as source assets, not embedded as large D1 BLOBs. Store binaries in object storage and keep object keys/metadata in D1.

The five seeded titles, in reading order, are 道德經淺易、論語淺易、大學淺易、中庸淺易、初修道感言.
