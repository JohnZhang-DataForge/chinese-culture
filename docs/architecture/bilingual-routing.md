# Bilingual Routing

**Current status:** Not implemented in `main`.  
**Target contract:** Agent 0 OpenSpec PR #3, Proposed (not yet Ready or merged).

## Current behavior

The current source has one English route tree:

- `/`
- `/learn/` and `/learn/<slug>/`
- `/culture/` and `/culture/<slug>/`
- `/festivals/` and `/festivals/<slug>/`
- `/books/` and `/books/<slug>/`
- `/events/` and English information pages

`src/layouts/BaseLayout.astro` emits `<html lang="en">`. Navigation is hard-coded in English. There is no locale switcher, locale resolver, `/en/` or `/zh-cn/` route tree, canonical URL or `hreflang` output in the inspected main source.

## Agent 0 proposed route contract

The Proposed locale contract in PR #3 defines:

- Locale identifiers: `en` and `zh-CN`.
- URL segments: `en` and `zh-cn`.
- Public route pattern: `/{localeSegment}/{section}/{slug}/`.
- Sections: `learn`, `culture`, `festivals`, `books`, `events`.
- Root `/` redirects to `/en/`.
- Existing unprefixed routes redirect to the matching `/en/` route.
- Existing English content slugs remain stable during the initial migration.
- Language switching resolves the counterpart using shared `contentId`, never by assuming slugs match.
- If a translation is not published, do not link to a broken/draft URL; show the language as unavailable or fall back to the locale index.
- Localized pages emit correct `lang`, canonical and alternate `hreflang` metadata.

The contract is Proposed, not Ready. Use it as the integration target only after Agent 0 merges it and announces the freeze.

## Cross-agent mismatch to resolve

Agent 6's current QA PR #6 refers to `/zh/` in its conditional tests. Agent 0's proposed contract uses `/zh-cn/`. The QA tests must be updated to the agreed path before the bilingual release gate is enabled. Agent 2 must also align its implementation with the frozen contract.

## Compatibility requirements

Do not rename existing English content slugs without explicit redirects. Verify every legacy unprefixed route redirects to its equivalent `/en/` route without loops. Do not silently serve an English page under a Chinese URL.

## Verification after implementation

Test both locale home pages, collection/detail pages, equivalent-page switching, missing translation behavior, root redirect, legacy redirects, trailing slashes, 404s, HTML `lang`, canonical URLs and reciprocal `hreflang`.
