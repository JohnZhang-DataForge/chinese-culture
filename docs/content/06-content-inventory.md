# Content Inventory — Current Multilingual Baseline

**Updated:** 2026-11-11  
**Verified Main:** `420520645642c0f1f87f3036cb4e158601f5779b`  
**Contract:** CC-CONTENT-001 v1.2.0  
**Purpose:** Record the actual article inventory, locale coverage, routes and CMS source-of-truth boundary. This document does not redefine the shared content schema.

## Summary

| Content area | Conceptual articles | Locales | Markdown variants |
|---|---:|---|---:|
| Beginner lessons | 5 | en, zh-CN, es | 15 |
| Culture articles | 3 | en, zh-CN, es | 9 |
| Festival guides | 3 | en, zh-CN, es | 9 |
| Book guides | 2 | en, zh-CN, es | 6 |
| **Total** | **13** | **3** | **39** |

Production D1 currently contains 13 conceptual content items, 39 locale variants and 39 revision records. The 39 Markdown variants under `src/content/` on Main are generated publication snapshots; D1 is the canonical editable content store. Do not edit generated snapshots as a substitute for the CMS authoring workflow when the GitHub App publishing integration is enabled.

## Article inventory

All locale variants for each row share one immutable `contentId`. Locale-specific titles and metadata may differ; locale-specific slugs are independently maintained.

| Collection | Existing slug | English title | Simplified Chinese title |
|---|---|---|---|
| lessons | `01-a-living-culture` | A Living Culture, Not a Single Story | 一种鲜活的文化，而非单一的故事 |
| lessons | `02-language-and-writing` | Language and Writing: First Steps | 语言与文字：入门 |
| lessons | `03-festivals-and-calendars` | Festivals and the Chinese Calendar | 节日与中国历法 |
| lessons | `04-art-of-the-brush` | The Brush as a Way of Seeing | 以笔为眼：一种观看世界的方式 |
| lessons | `05-stories-and-reading` | Stories, Books and Cultural Memory | 故事、书籍与文化记忆 |
| culture | `calligraphy-and-the-brush` | Calligraphy and the Brush | 书法与毛笔 |
| culture | `family-tables-and-hospitality` | Around the Family Table | 围坐家宴：餐桌与待客之道 |
| culture | `reading-a-painting` | How to Read a Chinese Painting | 如何欣赏一幅中国画 |
| festivals | `dragon-boat-festival` | Dragon Boat Festival: Water, Memory and Community | 端午节：江河、记忆与社群 |
| festivals | `mid-autumn-festival` | Mid-Autumn Festival: A Moon Shared Across Distance | 中秋节：一轮明月，连接远方 |
| festivals | `spring-festival` | Spring Festival: Welcoming a New Year | 春节：迎接新的一年 |
| books | `journey-to-the-west` | Journey to the West: A Reader's Guide | 《西游记》：读者指南 |
| books | `the-analects` | The Analects: A Reader's Guide | 《论语》：读者指南 |

The Spanish variants are present for all 13 concepts as well. Their localized titles and bodies remain in the corresponding `src/content/es/` collection.

## Route and locale conventions

- Supported locale identifiers: `en`, `zh-CN`, `es`.
- URL locale segments: `en`, `zh-cn`, `es`.
- Public article route: `/{localeSegment}/{section}/{slug}/`.
- The lessons collection is exposed through the `learn` route segment.
- Chinese source files live under `src/content/zh-cn/`; their frontmatter locale remains exactly `zh-CN`.
- Translation relationships use the shared immutable `contentId`; do not infer translated slugs from English slugs.
- Public routes, sitemap entries and featured modules include only published variants.

## Public pages and non-article content

The site also contains:
- Three localized homepages and section landing pages for Learn, Culture, Festivals, Books and Events.
- Five localized informational pages: About, Accessibility, Contact, Editorial Policy and Privacy.
- A locale-aware not-found page.
- A deliberately empty Events state until event information can be verified.

Do not invent event listings, organizer details, public contact addresses, review credentials or dates.

## Editorial and technical validation

- The 13 Simplified Chinese articles received a first source-to-translation review; see [Simplified Chinese editorial review](08-zh-cn-editorial-review-2026-11-11.md).
- PR #58 corrected the Qu Yuan narrative to remove an unsupported detail and standardized the Nian term as 年兽.
- `npm run validate:content`, repository unit tests, static build verification and Admin browser tests passed on the PR #58 change.
- The static verifier checks generated localized article routes, canonical/hreflang/language-switch destinations, sitemap coverage, image alt attributes and root-relative internal links.
- External further-reading references were checked on 2026-11-11. Seven unique URLs opened directly. The SCIO Mid-Autumn page was indexed in search but timed out on direct retrieval; the Association for Asian Studies page was indexed but returned HTTP 403 to the automated opener. These two fetch limitations do not establish that the links are broken; they should be rechecked from a normal browser if users report access problems.

## Important boundaries

- This inventory is descriptive, not a second schema. CC-CONTENT-001 v1.2.0 remains normative.
- Existing English slugs and content identity are stable. Translation variants may have their own localized titles and metadata.
- Do not bypass the normal draft, review and publication workflow by editing production D1 or merging generated content without review.
- Technical validation does not replace editorial judgment about historical claims, cultural context or translation quality.
