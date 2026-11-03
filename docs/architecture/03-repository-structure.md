# Repository and Documentation Structure

**Status:** Implemented baseline · **Updated:** 2026-11-04

The architecture has moved from planning-only to a static Astro application. The exact inventory is maintained in [the repository map](07-implemented-repository-map.md).

## Current areas

- `README.md`: project entry point, commands and status
- `package.json`: Node/Astro/Wrangler dependencies and scripts
- `astro.config.mjs`: `output: static`, with trailing-slash URLs
- `wrangler.jsonc`: Cloudflare Workers Free static asset directory, no script `main`
- `public/`: favicon, robots and HTTP security headers
- `src/pages/`: homepage, dynamic collection pages and static information pages
- `src/content/`: original Markdown lessons, articles, festivals and book guides
- `src/content.config.ts`: shared frontmatter validation
- `src/layouts/`: common public HTML shell
- `src/components/`: reusable content card
- `src/styles/`: color, typography, layout and responsive styles
- `src/lib/`: section-to-collection route mapping
- `scripts/`: Node-based static build checks
- `.github/workflows/`: PR and main branch build CI (no deployment)
- `docs/`: living requirements, ADRs, status, operations and templates

## Content routing

- `src/content/lessons/*.md` → `/learn/<file-id>/`
- `src/content/culture/*.md` → `/culture/<file-id>/`
- `src/content/festivals/*.md` → `/festivals/<file-id>/`
- `src/content/books/*.md` → `/books/<file-id>/`

Routes are generated at build time using Astro content collections. No runtime database query is needed. See [metadata and routes](08-content-schema-and-routing.md).

## Design constraints

No API/SSR/Node runtime server. Cloudflare serves HTML, CSS, JS and static files from build output. All visitor-facing text lives in source or Markdown; no third-party embedded analytics or image requests.

## Documentation responsibilities

Plan changes belong under `docs/plan/`. Architecture changes update an ADR and `docs/architecture/`. Code/content changes update [implementation status](../implementation/04-implementation-status.md) and [change log](../operations/03-change-log.md). Do not label unreleased code as publicly deployed.

## Future additions

Approved publishing media, client-side search if justified, translation support and verified events. Accounts, forms and dynamic APIs remain deferred pending new design and privacy review.
