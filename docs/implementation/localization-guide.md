# Localization Guide

**Current status:** The website is English-only in \`main\`.  
**Target contract:** Agent 0 CC-CONTENT-001 v1.0.0 and locale routing in PR #3 — Proposed, not yet Ready.

## Current behavior

- Public routes are unprefixed English paths such as \`/learn/\` and \`/culture/\`.
- The shared layout declares \`lang="en"\`.
- There is no language switcher.
- There are no \`/en/\` or \`/zh-cn/\` routes in current \`main\`.
- Optional Markdown field \`chinese\` stores Chinese terms/characters within an English page. It is not a translated page body.
- The current schema has no locale field, shared translation ID, locale-specific slug or translation completeness state.

## Proposed localization contract

Agent 0's PR #3 proposes:

- Locale IDs: \`en\` and \`zh-CN\`.
- URL prefixes: \`/en/\` and \`/zh-cn/\`.
- Root \`/\` redirects to \`/en/\`.
- Existing unprefixed English URLs redirect to equivalent \`/en/\` routes.
- English slugs remain stable during the initial migration.
- Translation variants share an immutable \`contentId\` and may have different slugs.
- The language switch finds the counterpart by \`contentId\`.
- If a translation is not published, show the language as unavailable or fall back to the locale index; never link to a draft route.
- Localized pages emit correct \`lang\`, canonical and alternate \`hreflang\` metadata.

The contract is Proposed. Wait for Agent 0's Ready announcement before moving files or treating the proposed rules as frozen.

## Current editor action

For an existing English article, an editor may add/correct the optional Chinese terminology field:

~~~yaml
chinese: "春节"
~~~

Do not put an entire Chinese translation in this field. Preserve English prose and sources.

## Translation quality after migration

- Preserve meaning and cultural nuance.
- Use Simplified Chinese for \`zh-CN\`.
- Keep names, dates, terms and citations consistent.
- Mark translations published only after human review.
- Check localized title, summary, body, navigation and metadata together.

## QA coordination

Agent 6's current QA PR references \`/zh/\`; Agent 0's proposed path is \`/zh-cn/\`. This must be reconciled before the bilingual release gate is enabled.

See [Bilingual Routing](../architecture/bilingual-routing.md) and [Localization Content Model](../architecture/localization-content-model.md).
