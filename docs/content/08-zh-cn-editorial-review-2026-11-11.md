# Simplified Chinese editorial review — first source-to-translation pass

**Date:** 2026-11-11  
**Scope:** The 13 published `zh-CN` article variants under `src/content/zh-cn/`, compared with their English source variants using the same immutable `contentId`.  
**Purpose:** Record a focused translation-fidelity and terminology pass. This is not a claim of independent external proofreading or final cultural sign-off.

## Coverage checked

- 5 learning lessons
- 3 culture articles
- 3 festival guides
- 2 book guides

All 13 Chinese variants were located and paired with the corresponding English article by `contentId`. The review compared headings, explanatory paragraphs, examples, caveats, reflection prompts, further-reading references, and internal links.

## Corrections applied in this pass

1. **Dragon Boat Festival — Qu Yuan narrative:** The Chinese text previously said people raced boats to search for Qu Yuan after his death. The English source only says that people raced boats or offered food in response to his death. The translation now follows the source and removes the unsupported “searching for him” detail.
2. **Spring Festival — Nian terminology:** The phrase “mythical creature Nian” now uses the style guide's preferred term “年兽”, while retaining the source's caveat that this is a traditional tale rather than a proven explanation for every historical practice.

## Checks and observations

- The 13 article variants retain the same immutable `contentId` as their English counterparts.
- The review did not identify a missing article-level section or a missing further-reading reference in this pass.
- The lesson link to `/zh-cn/learn/02-language-and-writing/` is intentional: `learn` is the approved localized route segment, while the underlying content collection is `lessonsZh`.
- Cultural scope markers such as “one widely told tradition”, “in some communities”, and “not every family” are generally preserved.
- The editorial style guide remains the terminology authority for the `zh-CN` edition.

## Remaining work

- Run the full repository content validator, unit tests, static build and Admin browser checks on the proposed changes.
- Continue a separate review of static-page UI copy, SEO metadata, image alt text, and external source-link reachability.
- Keep P3.5 open until the complete editorial review is recorded. Technical CI passing alone is not evidence of cultural or language quality.


## Production privacy-copy accuracy follow-up

The public site and protected Admin area have different behavior. The privacy notice now distinguishes public browsing (no visitor accounts, contact form, integrated analytics or advertising trackers; no application cookies intentionally set for public browsing) from the administrator-only area protected by Cloudflare Access, which may set authentication cookies for access control. The same clarification is applied to English, Simplified Chinese and Spanish copy and the legacy unprefixed privacy page.
