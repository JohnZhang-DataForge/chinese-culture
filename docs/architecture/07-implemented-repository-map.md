# Implemented Repository Map

**Status:** Static multilingual site deployed; D1-backed CMS integration in progress · **Last updated:** 2026-11-09

## Runtime and content data flow

    Admin browser
      → Cloudflare Access (exact administrator allowlist)
      → Pages Functions /api/admin/v1/*
      → D1 CMS_DB (canonical editorial data, translations, revisions, submissions)
      → reviewed GitHub CMS branch and PR
      → human merge to main
      → CI / Astro static build
      → Cloudflare Pages (public site remains static)

Public readers use only the generated static HTML, CSS, JS and public assets. They do not query D1 or the admin API.

## Concrete file and folder inventory

| Location | Responsibility |
|---|---|
| `package.json` | Astro, Wrangler, build/verify/test scripts |
| `astro.config.mjs` | Static Astro output and trailing-slash URLs |
| `wrangler.jsonc` | Pages project, output directory, CMS_DB D1 binding and non-secret runtime vars |
| `.github/workflows/site-ci.yml` | Local D1 migration validation, Node tests, build, local Pages Functions integration test and static verification |
| `.github/workflows/pages-deploy.yml` | Deploy static artifact and Pages Functions to Cloudflare Pages |
| `.github/workflows/cms-d1-bootstrap.yml` | Apply production D1 migrations and run idempotent content import after migration/import changes reach main |
| `database/migrations/` | Ordered D1 schema migrations |
| `scripts/import-content-to-d1.mjs` | Idempotently imports existing English, Simplified Chinese and Spanish Markdown with deterministic content IDs |
| `scripts/test-cms-local.mjs` | Exercises session, D1 CRUD, translations, preview and fail-closed publication/media behavior against local Pages Functions |
| `functions/_lib/` | CMS repository, Access JWT, CSRF, safe preview, GitHub App and publication synchronization helpers |
| `functions/api/admin/v1/` | Session, content CRUD, translation, preview, media upload, submission and PR status/sync endpoints |
| `src/pages/admin/index.astro` | Protected editorial workspace shell |
| `src/scripts/admin.mjs` | D1-backed admin UI, locale editor, PR state and media workflow |
| `src/lib/admin-api.mjs` | Same-origin Admin API client and CSRF handling |
| `src/lib/admin-ui.mjs` | Filtering, translation coverage and editor UI helpers |
| `src/content.config.ts` | Astro Markdown collection schema and locale loaders |
| `src/content/{lessons,culture,festivals,books}/` | English static publication snapshots |
| `src/content/zh-cn/` | Simplified Chinese static publication snapshots |
| `src/content/es/` | Spanish static publication snapshots |
| `public/media/` | Reviewed article image assets; included in static deployment after merge |
| `docs/openspec/contracts/` | Versioned content schema and Admin API OpenAPI contract |
| `docs/runbooks/` | Local D1 and GitHub App publication setup instructions |

## Current pages

Public locale roots: `/en/`, `/zh-cn/`, `/es/`; content collections: Learn, Culture, Festivals and Books. The events page remains a static information/empty state and is not yet a CMS-published collection.

## Security and release boundaries

- Cloudflare Access protects both `/admin/*` and `/api/admin/*`.
- Pages Functions validate the Access JWT and same-origin CSRF for mutations.
- GitHub App credentials are not yet configured; publish/media actions remain disabled until a repository-scoped App is installed and its Pages secrets are set.
- The CMS bootstrap workflow is the only production D1 migration/import path. Automated tests use local D1 only.

Every PR that moves a source directory, adds a route/data type, changes deployment mode or introduces a production service must update this map, [implementation status](../implementation/04-implementation-status.md) and [change log](../operations/03-change-log.md).
