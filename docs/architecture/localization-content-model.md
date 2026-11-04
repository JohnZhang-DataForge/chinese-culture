# Localization Content Model

**Current status:** English-only Markdown collections in \`main\`.  
**Target contract:** CC-CONTENT-001 v1.0.0 in Agent 0 PR #3 — Proposed, not yet Ready or merged.

## Current schema

\`src/content.config.ts\` currently defines four Astro Markdown collections: \`lessons\`, \`culture\`, \`festivals\` and \`books\`.

Current fields:

| Field | Required | Current meaning |
|---|---:|---|
| \`title\` | Yes | English title |
| \`description\` | Yes | English summary |
| \`category\` | Yes | English category label |
| \`chinese\` | No | Chinese term/characters within an English page |
| \`pinyin\` | No | Optional pronunciation metadata |
| \`level\` | No | Optional learning level |
| \`order\` | No | Optional ordering value |
| \`readingMinutes\` | No | Positive integer, default 5 |
| \`featured\` | No | Boolean, default false; not currently used for homepage selection |

The current schema has no locale, stable cross-language content ID, translation relation, localized slug, publication state, sources array, media metadata or tags.

## Proposed CC-CONTENT-001 v1.0.0

The contract in Agent 0 PR #3 proposes:

- Locale identifiers: \`en\` and \`zh-CN\`; URL segments \`en\` and \`zh-cn\`.
- Content path: \`src/content/{collection}/{locale}/{slug}.md\`.
- Media path: \`public/media/{contentId}/{safeFileName}\`.
- Immutable UUID \`contentId\`, shared by all locale variants of the same conceptual item.
- Unique key \`(contentId, locale)\`; localized slugs may differ.
- Required fields: \`contentId\`, \`locale\`, \`slug\`, \`title\`, \`description\`, \`category\`, \`status\`, \`featured\`, \`updatedAt\`.
- Optional fields: \`publishedAt\`, \`order\`, \`readingMinutes\`, \`level\`, \`chinese\`, \`pinyin\`, \`sources\`, \`media\`, \`tags\`.
- Status values: \`draft\`, \`published\`, \`unpublished\`.
- A published record requires \`publishedAt\`.
- Only \`status=published\` is eligible for public routes, sitemap, search or featured placement.
- \`featured\` is independent of status.
- Existing English slugs must be preserved during migration.

The \`chinese\` field remains an annotation, not a substitute for a \`zh-CN\` article.

## Proposed source and media metadata

A source record requires a title and HTTPS URL; publisher and accessed date are optional.

A media record requires:
- Root-relative \`src\` beginning with \`/media/\`.
- Accessible \`alt\` text (empty only for explicitly decorative media).
- \`credit\` and \`license\`.
- Optional HTTPS \`sourceUrl\` when needed to evidence rights.

Every image in a published article must have alt and rights metadata.

## Proposed migration

Agent 3's contract task is to move current English entries into \`src/content/{collection}/en/{existing-slug}.md\`, preserve the current slug, assign a stable UUID, add locale/status/timestamps and create reviewed \`zh-CN\` variants sharing the same \`contentId\`. Migration is not present in current \`main\`.

## Change control

Do not add a parallel schema or independently rename fields. Agent 0 must freeze the contract before Agent 2/3 implement against it. A schema change requires a versioned contract update and coordinated changes to Astro validation, CMS forms, Worker validation, fixtures and tests.
