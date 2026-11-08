# Shared Content Contract v1

**Contract ID:** CC-CONTENT-001  
**Version:** 1.2.0  
**Owner:** Agent 0  
**Consumers:** Agent 2 (Astro schema/routing), Agent 3 (migration/translation), Agent 4 (CMS forms), Agent 5 (API validation), Agent 6 (tests).

This document is normative. Do not introduce a parallel frontmatter model. A contract change requires an Agent 0 review and a versioned update before implementation continues.

## 1. Locale and route values

- Supported locale identifiers: en, zh-CN, es.
- URL locale segments: en, zh-cn, es.
- Public route pattern: /{localeSegment}/{section}/{slug}/.
- Sections: learn, culture, festivals, books, events.
- Default route / redirects to /en/.
- Existing unprefixed routes redirect to the matching /en/ route.
- File path: English: `src/content/{collection}/{slug}.md`; Simplified Chinese: `src/content/zh-cn/{collection}/{slug}.md`; Spanish: `src/content/es/{collection}/{slug}.md`.
- Media path: `public/media/{contentId}/{locale}/{randomUuid}.{ext}`; public URL path is `/media/{contentId}/{locale}/{randomUuid}.{ext}`.

## 2. Identity and translation relationship

contentId identifies the conceptual content item and is immutable. Every locale variant of the same item MUST use exactly the same contentId. Locale variants have independent slugs, titles, descriptions, body text, publication status and timestamps.

The unique key is (contentId, locale). A contentId can have at most one record per supported locale. A language switch looks up the other variant by contentId; it MUST NOT derive the translated slug from the current slug.

A locale variant is a full editorial document, not a machine-generated runtime overlay. A translation may be drafted or unpublished while another locale is published.

## 3. Required frontmatter

| Field | Type | Required | Rules |
|---|---|---:|---|
| contentId | string | yes | Immutable UUID; canonical lowercase UUID form |
| locale | enum | yes | en, zh-CN or es |
| slug | string | yes | Locale-specific kebab-case slug; unique per collection/locale |
| title | string | yes | Non-empty localized title |
| description | string | yes | Non-empty localized summary; plain text |
| seoTitle | string | no | Localized SEO title; falls back to title |
| seoDescription | string | no | Localized SEO description; falls back to description |
| category | string | yes | Localized display label |
| status | enum | yes | draft, published, unpublished |
| featured | boolean | yes | Defaults false; only public when status=published |
| updatedAt | date-time | yes | ISO 8601 timestamp |
| publishedAt | date-time | no | Required when status=published; retain historical value when unpublishing if useful |
| order | number | no | Sort order; non-negative |
| readingMinutes | positive integer | no | Defaults to 5 |
| level | string | no | Learning level when relevant |
| chinese | string | no | Chinese term annotation in English-language content; not a substitute for zh-CN translation |
| pinyin | string | no | Pinyin annotation for chinese |
| sources | array | no | Editorial source references; see below |
| imageUrl | HTTPS URL | no | Legacy/existing external cover image preserved from the current published source |
| imageAlt | string | no | Alternative text for the legacy/existing cover image |
| media | array | no | Newly uploaded image rights and accessibility metadata; see below |
| tags | string[] | no | Localized or controlled taxonomy terms |

Collection is inferred from the parent directory; do not duplicate it in frontmatter.

## 4. Additional object shapes

Source:
- title: required string
- url: required HTTPS URL
- publisher: optional string
- accessedAt: optional ISO 8601 date

Media:
- src: required root-relative path beginning /media/
- alt: required non-empty accessible description; decorative images use empty alt only when explicitly marked decorative=true
- decorative: optional boolean, default false
- credit: required string
- license: required string; use a documented value such as original, CC BY 4.0, public-domain-verified, or permission-granted
- sourceUrl: optional HTTPS URL; required when credit/license needs an external source reference

Newly uploaded media requires a complete rights/accessibility record. The upload is committed to a dedicated GitHub branch and reviewed PR; D1 attaches the media record only after that PR merges. The article remains locked while the media PR is open. Existing HTTPS cover images imported from the live site are preserved in `imageUrl`/`imageAlt` as a legacy exception; no license or credit may be inferred.

## 5. Example: English and Chinese variants

English:
~~~yaml
---
contentId: "9c6b1e62-7f8c-4c3a-a9f4-4e8c7c2b1d10"
locale: "en"
slug: "a-living-culture"
title: "A Living Culture, Not a Single Story"
description: "An introduction to the people and changing traditions behind culture."
category: "Foundations"
status: "published"
featured: true
updatedAt: "2026-11-05T12:00:00Z"
publishedAt: "2026-11-05T12:00:00Z"
readingMinutes: 5
sources:
  - title: "Example educational reference"
    url: "https://example.org/reference"
    publisher: "Example publisher"
---
English Markdown body.
~~~

Simplified Chinese translation:
~~~yaml
---
contentId: "9c6b1e62-7f8c-4c3a-a9f4-4e8c7c2b1d10"
locale: "zh-CN"
slug: "wenhua-bushi-dan-yige-gushi"
title: "文化不止一个故事"
description: "从人群、地域与不断变化的传统认识文化。"
category: "文化基础"
status: "draft"
featured: false
updatedAt: "2026-11-05T12:00:00Z"
readingMinutes: 5
---
简体中文 Markdown 正文。
~~~

The example UUID is illustrative only. Agent 3 must assign unique IDs to actual migrated content and preserve each ID thereafter.

## 6. Status semantics

| State | Canonical editorial storage | Generated GitHub snapshot | Public build |
|---|---|---|---|
| draft | D1 content variant + immutable revision | none on Save Draft; a draft snapshot is generated only when submitted for review | excluded |
| published | D1 status changes to published only after the matching publish PR merges; a new immutable revision records the transition | CMS branch/PR snapshot; becomes the main-branch snapshot only after reviewed merge | included only after the merged snapshot is deployed |
| unpublished | D1 status changes to unpublished only after the matching unpublish PR merges; a new immutable revision records the transition | CMS branch/PR snapshot; becomes the main-branch snapshot only after reviewed merge | excluded after the merged snapshot is deployed |

featured is independent of status. The public site must always apply status=published before featured filtering. D1 is the canonical editable source; files under src/content/ on main are generated static publication snapshots, not the CMS authoring store.

Save Draft writes status=draft and a new revision to D1. It does not create a GitHub branch or commit. Submit-for-review exports a non-public editorial snapshot to a CMS-owned branch and opens a PR under `content-reviews/`; merging that PR does not publish the article. Publish exports the current D1 draft to the locale's public Markdown path. D1 remains unchanged while the PR is open; after a human-authorized merge, the explicit PR-sync endpoint changes D1 status to published, sets publishedAt and appends a new immutable revision. Unpublish exports a deletion of the public Markdown file; D1 remains published while the PR is open and changes to unpublished only after the reviewed merge and PR-sync. Media upload commits an asset to a separate review PR; D1 attaches its media metadata only after that PR merges. The CMS API never merges a PR or writes directly to main.

## 7. Validation rules

1. contentId must be a valid UUID and must not change when editing or translating.
2. locale must be exactly en, zh-CN or es.
3. slug must match ^[a-z0-9]+(?:-[a-z0-9]+)*$.
4. title, description and category must be non-empty.
5. status must be one of draft, published or unpublished.
6. featured must be a boolean.
7. publishedAt is required when status is published.
8. updatedAt must parse as ISO 8601.
9. seoTitle and seoDescription, when present, must be non-empty plain text within API length limits; otherwise public metadata falls back to title and description.
10. contentId/locale must be unique across the repository.
11. collection/locale/slug must be unique.
12. zh-CN records must contain Simplified Chinese content; en records use English; es records use Spanish.
13. Every image in a published record must have alt and rights metadata.
14. No draft or unpublished record may generate a public route, sitemap entry, public search record or featured card.
15. Content source links must be HTTPS; redirects and external URL status are checked by QA where feasible.

## 8. Migration from current main into D1

Current files are in `src/content/{collection}/{slug}.md`, `src/content/zh-cn/{collection}/{slug}.md` and `src/content/es/{collection}/{slug}.md`. They are migration inputs and the current public snapshot; they are not the future editorial source of truth. D1 stores the canonical content records. The same locale-specific paths on `main` are generated publication snapshots produced from approved D1 revisions.

Agent 3 SHALL:
- Inventory all current English Markdown files and preserve every original body, frontmatter value and existing public slug.
- Assign one immutable UUID contentId per conceptual article and retain it across all translations and future revisions.
- Prepare a schema-validated seed dataset under database/seeds/ containing the complete content variant fields, bodyMarkdown and contentId. The seed format and importer contract must be agreed with Agent 5 before import.
- Preserve existing English articles that are already live on main as published records when their current public content is imported unchanged; record the source commit and import provenance. Do not silently unpublish existing live content.
- Create zh-CN variants using the same contentId and localized slugs. Missing or unreviewed translations must remain draft or be absent; never invent a translation or mark one published without editorial review.
- Report counts by collection, locale and status, including missing translations.
- Make the seed process repeatable and idempotent; Agent 5 owns the importer and all database migrations.

Agent 5 SHALL import approved seed records into D1. The CMS snapshot exporter SHALL generate the locale-specific Markdown publication files from the exact selected D1 revision.

Agent 2 SHALL implement the Astro schema and route generation for the generated locale snapshots in src/content.config.ts and the public routing layer. Agent 3 must not edit those shared implementation files.

## 9. Compatibility

Do not silently rename existing English slugs. Legacy unprefixed routes redirect to /en/ equivalents. If any slug must change, add an explicit old-to-new redirect and test it. Update internal Markdown links as part of migration.

## 10. Change control

Schema additions, removals or semantic changes require:
- Proposed version bump and migration note.
- Agent 0 approval.
- Updates to Astro schema, API schemas, CMS validation, fixtures and tests.
- No unilateral schema edits by Agents 2, 3, 4 or 5.


## 11. Spanish and legacy cover metadata amendment (v1.2.0)

The CMS supports three full locale variants: `en`, `zh-CN` and `es`. Spanish uses the `/es/` route segment and is stored as locale `es`. Existing Spanish Markdown files are already published on the live site and must be imported unchanged with the same immutable contentId as their English and Chinese counterparts.

Existing external cover images are preserved separately as `imageUrl` and `imageAlt`. They are not treated as newly uploaded media and no image credit or license may be inferred. New uploaded media continues to require the complete rights and accessibility metadata defined in this contract.
