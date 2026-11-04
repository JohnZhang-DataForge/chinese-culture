# Localization Content Model

**Current status:** English-only Markdown collections with optional Chinese terminology; full translation relationships are not implemented.

## Current schema

\`src/content.config.ts\` defines four Astro content collections using Markdown files loaded from \`src/content/<collection>/\`:

- \`lessons\`
- \`culture\`
- \`festivals\`
- \`books\`

The shared Zod schema currently contains:

| Field | Required | Current meaning |
|---|---:|---|
| \`title\` | Yes | English title |
| \`description\` | Yes | English summary |
| \`category\` | Yes | English category label |
| \`chinese\` | No | Chinese term/characters displayed within an English page |
| \`pinyin\` | No | Optional pronunciation metadata |
| \`level\` | No | Optional learning level |
| \`order\` | No | Optional ordering value |
| \`readingMinutes\` | No | Positive integer, default 5 |
| \`featured\` | No | Boolean, default false; current homepage code does not use it to select featured content |

The Markdown filename becomes the Astro collection entry ID and is used as the public slug. The current schema has no locale field, stable cross-language content ID, translation relation, localized slug, publication state, author/reviewer metadata or cover-image field.

## What the Chinese field does not mean

The optional \`chinese\` field is not a Chinese translation of the article. It stores a Chinese term or characters shown inside an English article/card. Current pages do not have paired English and Simplified Chinese bodies.

## Future model requirements

Agent 0 must approve the content contract before localization code or CMS integration is documented as final. At minimum, that contract should define:

- Stable content identity independent of translated filenames.
- Locale identifiers and supported locales.
- English/Chinese relationship and translation completeness.
- Locale-specific title, summary, body, slug and SEO metadata.
- Draft/published/unpublished semantics and default behavior.
- Validation for missing or malformed translations.
- How the public site behaves when one locale is absent.
- How the admin CMS reads and writes the same model.

Do not invent a field naming convention or publish a second schema here that conflicts with Agent 0's contract.

## Current authoring location

Add or edit English Markdown in the matching collection folder. Use the existing schema exactly; invalid required metadata causes the Astro build to fail. See [content management guide](../implementation/content-management-guide.md).

## Migration caution

Keep current file IDs and English URLs stable until the approved localization plan defines route redirects. Preserve the existing English prose and citations during translation work.
