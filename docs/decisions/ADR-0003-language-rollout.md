# ADR-0003: English, Simplified Chinese and Spanish Publication

**Status:** Accepted — public static localization baseline  
**Date:** 2026-11-08

## Context

Chinese Culture Atlas serves international audiences. The public site began in English and already includes culturally accurate Chinese terms. The project owner has requested full public-language versions in Simplified Chinese and Spanish, not a Google Translate redirect or a third-party translation overlay.

## Decision

1. English remains the default editorial source language and is published under `/en/`.
2. Simplified Chinese is published under `/zh-cn/`.
3. Spanish is published under `/es/`.
4. Existing unprefixed URLs redirect to their English `/en/` counterparts so old links remain usable.
5. The language selector links only to this site's own locale routes. It does not send visitors to Google Translate or another translation host.
6. The first public localization increment uses static Astro output and locale-specific Markdown content. It does not call a paid translation API or require a runtime translation service.
7. Current Chinese and Spanish copy is AI-assisted and must be visibly identified as awaiting human editorial review until a qualified reviewer approves it. Do not describe pending copy as independently verified.
8. The language switcher preserves the equivalent section/article path where a counterpart exists. Future CMS work must resolve variants through stable content identity rather than assuming slugs will always match.

## Consequences

The site can serve English, Simplified Chinese and Spanish from the same Cloudflare Pages domain with static files. Translation quality review remains an editorial task. New English content must not silently appear as a fully reviewed translation; the CMS/content workflow should track locale completeness and review status.

## Follow-up

- Add Spanish to the bilingual CMS proposal and shared content contract.
- Establish a terminology glossary for Chinese cultural terms and preferred Spanish renderings.
- Assign human reviewers for Simplified Chinese and Spanish before removing the AI-assisted review notice.
- Add translation completeness and link-equivalence checks to CI.

## Review trigger

Revisit this decision if the audience, reviewer capacity, language scope or hosting constraints change.
