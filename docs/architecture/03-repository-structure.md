# Repository and Documentation Structure

**Status:** Implemented multilingual Astro + Pages Functions + D1 CMS · **Updated:** 2026-11-11

## Main source areas

- `src/pages/`: public locale routes, static information pages and Admin shell.
- `src/content/`: generated Markdown publication snapshots for English, Simplified Chinese and Spanish.
- `src/i18n/`: localized UI copy and section/page metadata.
- `src/layouts/`, `src/components/`, `src/styles/`: public presentation.
- `functions/api/admin/v1/`: protected CMS endpoints.
- `functions/_lib/`: Access/JWT, CSRF, repository, preview and publication helpers.
- `database/migrations/`: ordered D1 schema migrations.
- `scripts/`: content validation, idempotent import, static verification and local CMS tests.
- `public/`: public assets, headers and redirect configuration.
- `.github/workflows/`: CI, Pages deployment and explicit D1 bootstrap.
- `docs/architecture/`: architecture and implementation decisions.
- `docs/content/`: editorial strategy, content inventory and locale style guides.
- `docs/openspec/`: normative contracts, proposals and implementation tasks.
- `docs/runbooks/`: local D1 and GitHub App publication operations.

## Content paths and public routes

| Content directory | Public section |
|---|---|
| `src/content/lessons/` and locale variants | `/{locale}/learn/{slug}/` |
| `src/content/culture/` and locale variants | `/{locale}/culture/{slug}/` |
| `src/content/festivals/` and locale variants | `/{locale}/festivals/{slug}/` |
| `src/content/books/` and locale variants | `/{locale}/books/{slug}/` |

Locale identifiers are `en`, `zh-CN`, `es`; URL segments are `en`, `zh-cn`, `es`. The `learn` route maps to the `lessons` collection.

## Source-of-truth boundaries

D1 (`CMS_DB`) is the canonical editable content store. Files under `src/content/` on Main are generated publication snapshots. Public Astro routes are static. Pages Functions are used for protected Admin operations only.

See [implemented repository map](07-implemented-repository-map.md), [content schema](08-content-schema-and-routing.md) and [content inventory](../content/06-content-inventory.md).
