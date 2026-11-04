# Implemented Repository Map

**Status:** Verified against main commit `539b37c9bfa5363f7149c95563bd549957eeff3d` · **Updated:** 2026-11-05.

## Build and delivery

Private GitHub source → pull request review → `main` → GitHub Actions (Node 22) → Astro static build → `dist/` → Wrangler Direct Upload → Cloudflare Pages Free.

## Application files

| Location | Responsibility |
|---|---|
| `package.json` | Astro, Wrangler and dev/build/verify/deploy scripts |
| `astro.config.mjs` | Static output and trailing-slash URLs |
| `wrangler.jsonc` | Pages project name, compatibility date and `./dist` output |
| `src/layouts/BaseLayout.astro` | HTML shell, English navigation, footer and skip link |
| `src/components/StoryCard.astro` | Reusable content card |
| `src/styles/global.css` | Typography, layout, responsive styles and focus treatment |
| `src/content.config.ts` | Four Markdown collection definitions and frontmatter schema |
| `src/lib/sections.ts` | Collection-to-route configuration |
| `src/pages/index.astro` | Hard-coded English homepage sections |
| `src/pages/[section]/index.astro` | Static collection indexes |
| `src/pages/[section]/[slug].astro` | Static content detail pages |
| `src/pages/events/index.astro` | Hard-coded Events empty state |
| `src/pages/about.astro` | About page |
| `src/pages/contact.astro` | Contact-channel pending state |
| `src/pages/editorial-policy.astro` | Editorial policy |
| `src/pages/privacy.astro` | Initial privacy notice |
| `src/pages/accessibility.astro` | Accessibility statement and audit gap |
| `src/pages/404.astro` | Not-found page |
| `src/content/lessons/` | Five beginner lessons |
| `src/content/culture/` | Three culture articles |
| `src/content/festivals/` | Three evergreen festival guides |
| `src/content/books/` | Two book-reading guides |
| `public/favicon.svg` | Site favicon |
| `public/_headers` | Current response headers |
| `public/robots.txt` | Allows crawler access |
| `scripts/verify-static.mjs` | Static route, link and Pages-limit checks |

## CI and deployment

| Location | Responsibility |
|---|---|
| `.github/workflows/site-ci.yml` | Pull-request and main build verification |
| `.github/workflows/pages-deploy.yml` | Wrangler Pages Direct Upload |
| `docs/architecture/` | Architecture and implementation-oriented system docs |
| `docs/implementation/` | Owner, developer, deployment and test guides |
| `docs/operations/` | Cloudflare, credentials, security and recovery guides |

## Current route inventory

The last detailed static verifier evidence recorded 25 generated pages, 13 educational guides, 29 output files and 700 checked local links. The current CI run also succeeded on main. Re-run the verifier after route/content changes rather than treating old counts as permanent.

## Explicit exclusions

The inspected source has no bilingual route tree, language switcher, admin dashboard, admin API, Pages Functions, database, media upload service, event collection or login mechanism.

## Maintenance rule

A PR that moves source files, adds a route or collection, changes deployment mode, introduces a runtime service or adds a media/authentication feature must update this map and [implementation status](../implementation/implementation-status.md).
