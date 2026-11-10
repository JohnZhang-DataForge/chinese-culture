# System Architecture — Static Public Site and D1-backed Admin

**Status:** Implemented baseline; GitHub App publication integration remains blocked on owner setup · **Updated:** 2026-11-11

## Production topology

```text
Public reader
  -> Cloudflare Pages
  -> Astro-generated HTML / CSS / JS / media
  -> no D1 or Admin API request for public article rendering

Administrator
  -> Cloudflare Access (administrator allowlist)
  -> Pages Admin UI (/admin/)
  -> Pages Functions (/api/admin/v1/*)
  -> Access JWT + role + Origin + CSRF validation
  -> D1 CMS_DB (canonical content, locale variants, revisions)
  -> repository-scoped GitHub App (not yet configured)
  -> CMS branch + pull request
  -> human review and merge to main
  -> Astro static build and Pages deployment
```

## System boundaries

- **Public content:** static, cacheable, locale-aware and independent of D1 at request time.
- **Editorial data:** D1 is the canonical editable store. The 39 Markdown variants on `main` are generated publication snapshots.
- **Admin security:** Cloudflare Access protects Admin routes; Pages Functions verify Access identity, administrator role, origin and CSRF token for mutations.
- **GitHub publication:** designed to create branches and PRs only. The CMS must never auto-merge or write directly to `main`.
- **Deployment:** CI validates the repository; a Main push deploys static output and Pages Functions to the existing Pages project.

## Current verified data

- 13 conceptual content items.
- 39 locale variants: 13 English, 13 Simplified Chinese and 13 Spanish.
- 39 initial revision snapshots.
- Production D1 database is bound through `CMS_DB`.

## Outstanding production gates

The GitHub App is not installed/configured and its production Pages settings are absent. Therefore GitHub PR publication and media-upload acceptance remain blocked. Authenticated production CRUD, publish/unpublish acceptance, main-branch ruleset configuration and Pages rollback rehearsal also remain open.

## Design rules

1. Keep public routes static unless a separately approved architecture change justifies SSR.
2. Keep D1 private; never expose database credentials to browser code.
3. Use immutable content identity across locales; do not infer translation slugs.
4. Preserve revision history and optimistic concurrency.
5. Require human review before any publication PR merges.
6. Keep automated tests on local D1 only.
