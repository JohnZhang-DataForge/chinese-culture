# Content Schema and Routing

**Status:** Current English-only Markdown implementation · **Updated:** 2026-11-05.

## Source of truth

Markdown files live under \`src/content/\` in the \`lessons\`, \`culture\`, \`festivals\` and \`books\` collections. \`src/content.config.ts\` uses Astro's \`glob\` loader and a shared Zod schema.

## Actual frontmatter schema

| Field | Required | Type / behavior |
|---|---:|---|
| \`title\` | Yes | String |
| \`description\` | Yes | String |
| \`category\` | Yes | String |
| \`chinese\` | No | Optional Chinese characters/term |
| \`pinyin\` | No | Optional string |
| \`level\` | No | Optional string |
| \`order\` | No | Optional number |
| \`readingMinutes\` | No | Positive integer; default 5 |
| \`featured\` | No | Boolean; default false; not currently used by homepage selection |

There is no locale, translation ID, publication status, localized slug, cover image or CMS audit field in the current schema.

## Current routes

- \`src/content/lessons/<file>.md\` → \`/learn/<file>/\`
- \`src/content/culture/<file>.md\` → \`/culture/<file>/\`
- \`src/content/festivals/<file>.md\` → \`/festivals/<file>/\`
- \`src/content/books/<file>.md\` → \`/books/<file>/\`

The filename without \`.md\` is the entry ID and URL slug. Astro enumerates static paths at build time.

## Ordering and homepage behavior

Collection index pages sort by \`order\` (missing values sort after explicit order), then title. The homepage sorts lessons by \`order\` and shows the first three. It takes the first three culture and festival entries without filtering by \`featured\`.

## Current limitations

- Only English page bodies are implemented.
- The \`chinese\` field is terminology, not a translated body.
- No events collection exists.
- No draft/publish status exists; files in collections are included in the build.
- No canonical or alternate-language metadata is emitted by the shared layout.
- No language switcher exists.

For localization, use [Bilingual Routing](bilingual-routing.md) and [Localization Content Model](localization-content-model.md). Agent 0's approved contracts must govern any new schema.
