# Technology Selection

**Status:** Proposed — verify current provider limits before implementation.

## Initial recommendation

| Concern | Recommendation | Rationale |
|---|---|---|
| Website framework | Astro, static output | Content-centered pages, fast delivery, progressive interactivity |
| Content source | Markdown under Git | Reviewable changes, version history and no database dependency |
| Hosting | Cloudflare Workers Static Assets | CDN-backed static delivery; evaluate free-tier constraints |
| Source control | Private GitHub repository | Pull-request review, issue tracking and history |
| Styling | Lightweight responsive CSS | Avoid dependency on a heavy UI framework |
| Images | Optimized owned or licensed assets | Good loading speed and rights control |
| Search | Native navigation first; static index if needed | No paid search service for MVP |
| Analytics | Aggregate, privacy-conscious option | Avoid tracking visitors unnecessarily |
| Forms | External contact method initially | No initial backend or personal data storage |

## Why not a full CMS or database?

The initial content is a finite, curated educational collection. Editors can work through Markdown and GitHub review; visitor-specific storage is unnecessary. A CMS may help only when editor volume or needs make Git editing impractical.

## Why static-first?

It reduces attack surface, operational overhead and recurring cost. Most pages can be generated at build time; a public-facing site can still be deployed from a private repository.

## Tradeoffs

Git-based content review requires editorial discipline and some contributor training. Static sites cannot natively process event registrations, accounts, dynamic comments or server-side search. Document those as deferred decisions.

## Decision checkpoints

Before coding, confirm supported framework version, Cloudflare hosting documentation, available free-tier limits, build configuration, team familiarity and domain ownership. A future change of stack requires an ADR.
