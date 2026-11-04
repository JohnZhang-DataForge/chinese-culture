# Implemented Repository Map

**Status:** MVP source implemented · **Last updated:** 2026-11-04

## Runtime and build data flow

    Private GitHub PR → editorial/code review → main
      → CI with Node.js 22 → Astro static build
      → dist/ static HTML, CSS and public assets
      → Wrangler Direct Upload
      → Cloudflare Pages Free
      → readers (no live Node.js server)

## Concrete file and folder inventory

| Location | Responsibility |
|---|---|
| `package.json` | Astro dependency, Wrangler CLI and dev/build/verify/Pages deploy scripts |
| `astro.config.mjs` | Forces static output and trailing-slash URLs |
| `wrangler.jsonc` | Cloudflare Pages build output directory `./dist` |
| `.github/workflows/site-ci.yml` | Install, build, verify and publish a short-lived static artifact |
| `.github/workflows/pages-deploy.yml` | Credential-gated Wrangler Direct Upload to Cloudflare Pages |
| `public/favicon.svg` | Original project mark; no external image source |
| `public/_headers` | Basic security-related response headers |
| `public/robots.txt` | Robot instructions; indexing policy requires launch review |
| `src/layouts/BaseLayout.astro` | Page head, navigation, mobile menu, footer and skip link |
| `src/components/StoryCard.astro` | Card component shared by indexes and home page |
| `src/styles/global.css` | Visual tokens, typography, layout, media queries and reduced motion |
| `src/content.config.ts` | Schema for Markdown frontmatter and collection loaders |
| `src/lib/sections.ts` | Navigation/category section definitions |
| `src/pages/index.astro` | Home landing page and featured learning sections |
| `src/pages/[section]/index.astro` | Generated indexes for Learn, Culture, Festivals, Books |
| `src/pages/[section]/[slug].astro` | Generated educational article/lesson detail pages |
| `src/pages/events/index.astro` | Honest empty state; unverified events not published |
| `src/pages/about.astro` | Project background and approach |
| `src/pages/contact.astro` | Contact-channel status, no fabricated address |
| `src/pages/editorial-policy.astro` | Editorial standards |
| `src/pages/privacy.astro` | Initial privacy disclosure, prelaunch review required |
| `src/pages/accessibility.astro` | Accessibility intention and known audit gap |
| `src/pages/404.astro` | Not-found page |
| `src/content/lessons/` | Five ordered beginner lessons |
| `src/content/culture/` | Three cultural introductions |
| `src/content/festivals/` | Three evergreen festival explainers |
| `src/content/books/` | Two reading guides to classical works |
| `scripts/verify-static.mjs` | Ensures expected static routes, no SSR Worker and Pages Free file limits |

## Current pages

Generated: home, four collection indexes, thirteen article/lesson details, events and five information pages plus 404. No calendar/event submissions or contact form are implemented.

## How to update this map

Every PR that moves a source directory, adds a new route/data type, changes deployment mode or introduces a new production service must update this file, [implementation status](../implementation/04-implementation-status.md) and [change log](../operations/03-change-log.md).

## Architecture exclusions

No `@astrojs/cloudflare` adapter, Pages Functions, `src/worker` entrypoint, D1/KV/R2 database, account management, paid API or continuous background jobs.
