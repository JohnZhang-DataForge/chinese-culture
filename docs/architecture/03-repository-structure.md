# Repository Structure

**Status:** Implemented baseline · **Updated:** 2026-11-05.

The exact source inventory is maintained in [Implemented Repository Map](07-implemented-repository-map.md).

## Current top-level structure

- `src/pages/`: Astro public routes.
- `src/layouts/`: shared page shell.
- `src/components/`: reusable components.
- `src/styles/`: global CSS.
- `src/content/`: lessons, culture, festivals and books Markdown collections.
- `src/content.config.ts`: Astro collection schema and loaders.
- `src/lib/sections.ts`: section-to-collection route metadata.
- `public/`: static favicon, headers and robots file.
- `scripts/verify-static.mjs`: static-output checks.
- `.github/workflows/site-ci.yml`: pull-request and main CI.
- `.github/workflows/pages-deploy.yml`: main-branch Pages Direct Upload.
- `docs/`: architecture, implementation, operations and planning documentation.

## Content routing

- `src/content/lessons/*.md` → `/learn/<slug>/`
- `src/content/culture/*.md` → `/culture/<slug>/`
- `src/content/festivals/*.md` → `/festivals/<slug>/`
- `src/content/books/*.md` → `/books/<slug>/`

Astro generates the collection pages during build time. The filename becomes the entry ID and public slug.

## Workflow

The CI workflow runs on pull requests and pushes to `main`. The separate deployment workflow runs on pushes to `main` and manual dispatch. The previous statement that the workflows were build-only is obsolete.

## Scope boundary

Agent 7 owns the architecture, implementation and operations documentation directories. Agent 0 owns `docs/openspec/`. Application source and other agents' implementation files are not modified by this documentation work.
