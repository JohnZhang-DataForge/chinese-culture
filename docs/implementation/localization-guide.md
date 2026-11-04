# Localization Guide

**Current status:** The website is English-only. Full Simplified Chinese localization is not implemented in the inspected source.

## Current behavior

- Public routes are unprefixed English routes such as \`/learn/\` and \`/culture/\`.
- The shared layout declares \`lang="en"\`.
- There is no EN/中文 switcher.
- There are no \`/en/\` or \`/zh/\` route trees.
- The optional Markdown field \`chinese\` stores Chinese characters/terms within an English page. It is not a translated page body.
- The current schema does not define locale-specific slugs, translation IDs, translated SEO fields or translation completeness.

## What an editor can do today

For an existing English article, an editor can add or correct the optional Chinese term field if appropriate:

~~~yaml
chinese: "春节"
~~~

Use the existing content schema and keep the English title, summary and article body intact. Do not place an entire Chinese translation into the \`chinese\` field.

## Do not create unofficial locale routes

Do not manually add \`/zh/\` or \`/en/\` folders, change old URLs, or create a separate translation schema before Agent 0's approved localization contract is available. Agent 2's task brief proposes localized route prefixes, but the actual canonical route and fallback behavior must be aligned with that contract.

## Translation quality

When the approved model is implemented:

- Preserve the meaning and cultural nuance of the English source.
- Use Simplified Chinese consistently unless the contract says otherwise.
- Keep names, dates, terms and citations consistent.
- Mark translations as reviewed only after a human language/editorial review.
- Do not describe machine-generated text as human-reviewed.
- Check translated page title, description, body, navigation and metadata together.

## Verification after localization is merged

Test route pairing, switcher behavior, missing-translation fallback, root-path behavior, HTML \`lang\`, canonical URLs, \`hreflang\`, trailing slashes, old English URLs and 404s. See [Bilingual Routing](../architecture/bilingual-routing.md).
