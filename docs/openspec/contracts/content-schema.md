# Shared Content Contract v1

**Contract ID:** CC-CONTENT-001  
**Version:** 1.1.0  
**Owner:** Agent 0  
**Consumers:** Agent 2 (Astro schema/routing), Agent 3 (migration/translation), Agent 4 (CMS forms), Agent 5 (API validation), Agent 6 (tests).

This document is normative. Do not introduce a parallel frontmatter model. A contract change requires an Agent 0 review and a versioned update before implementation continues.

## 1. Locale and route values

- Supported locale identifiers: en, zh-CN.
- URL locale segments: en, zh-cn.
- Public route pattern: /{localeSegment}/{section}/{slug}/.
- Sections: learn, culture, festivals, books, events.
- Default route / redirects to /en/.
- Existing unprefixed routes redirect to the matching /en/ route.
- File path: src/content/{collection}/{locale}/{slug}.md.
- Media path: public/media/{contentId}/{safeFileName}.

## 2. Identity and translation relationship

contentId identifies the conceptual content item and is immutable. Every locale variant of the same item MUST use exactly the same contentId. Locale variants have independent slugs, titles, descriptions, body text, publication status and timestamps.

The unique key is (contentId, locale). A contentId can have at most one record per supported locale. A language switch looks up the other variant by contentId; it MUST NOT derive the translated slug from the current slug.

A locale variant is a full editorial document, not a machine-generated runtime overlay. A translation may be drafted or unpublished while another locale is published.

## 3. Required frontmatter

| Field | Type | Required | Rules |
|---|---|---:|---|
| contentId | string | yes | Immutable UUID; canonical lowercase UUID form |
| locale | enum | yes | en or zh-CN |
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
| media | array | no | Image rights and accessibility metadata; see below |
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

The media record is required for every image used in a published article. A rights statement must not be inferred from the file extension or uploader identity.

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

| State | Stored where | Public build | CMS actions |
|---|---|---|---|
| draft | CMS branch; may also be merged as editorial draft if explicitly approved | excluded | edit, preview, submit for review, discard |
| published | main after reviewed merge | included | edit, create update PR, unpublish PR |
| unpublished | main after reviewed merge | excluded | edit, republish PR |

featured is independent of status. The public site must always apply status=published before featured filtering.

Save Draft always persists status=draft on the CMS branch. Submit-for-review creates/updates a PR with status=draft. Publish changes the PR branch to status=published and requests review; it does not merge. Unpublish changes the PR branch to status=unpublished and requests review.

## 7. Validation rules

1. contentId must be a valid UUID and must not change when editing or translating.
2. locale must be exactly en or zh-CN.
3. slug must match ^[a-z0-9]+(?:-[a-z0-9]+)*$.
4. title, description and category must be non-empty.
5. status must be one of draft, published or unpublished.
6. featured must be a boolean.
7. publishedAt is required when status is published.
8. updatedAt must parse as ISO 8601.
9. seoTitle and seoDescription, when present, must be non-empty plain text within API length limits; otherwise public metadata falls back to title and description.
10. contentId/locale must be unique across the repository.
11. collection/locale/slug must be unique.
12. zh-CN records must contain Simplified Chinese content; en records use English as the primary language.
13. Every image in a published record must have alt and rights metadata.
14. No draft or unpublished record may generate a public route, sitemap entry, public search record or featured card.
15. Content source links must be HTTPS; redirects and external URL status are checked by QA where feasible.

## 8. Migration from current main

Current files are in src/content/{collection}/{slug}.md and use title, description, category, optional chinese, pinyin, level, order, readingMinutes and featured.

Agent 3 SHALL:
- Move each current English record to src/content/{collection}/en/{existing-slug}.md.
- Preserve its existing slug exactly.
- Assign one immutable contentId per conceptual article.
- Add locale: en, status: published (only after editorial review), featured: existing value or false, updatedAt and publishedAt as appropriate.
- Keep chinese/pinyin as optional annotations, not translation flags.
- Create zh-CN variants with the same contentId and localized slugs.
- Report content counts by collection, locale and status.
- Never invent a Chinese translation or mark a translation published without review.

Agent 2 SHALL implement the schema and route generation in src/content.config.ts and the Astro routing layer. Agent 3 must not edit those shared implementation files.

## 9. Compatibility

Do not silently rename existing English slugs. Legacy unprefixed routes redirect to /en/ equivalents. If any slug must change, add an explicit old-to-new redirect and test it. Update internal Markdown links as part of migration.

## 10. Change control

Schema additions, removals or semantic changes require:
- Proposed version bump and migration note.
- Agent 0 approval.
- Updates to Astro schema, API schemas, CMS validation, fixtures and tests.
- No unilateral schema edits by Agents 2, 3, 4 or 5.
