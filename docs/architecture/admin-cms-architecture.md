# Admin CMS Architecture

**Status:** D1-backed Admin foundation deployed; GitHub App publication integration and production acceptance remain pending.

## Current production topology

~~~text
Administrator browser
  -> Cloudflare Access
  -> Static Admin shell on Cloudflare Pages
  -> Pages Functions /api/admin/v1/*
  -> Access JWT, role, Origin and CSRF validation
  -> D1 CMS_DB (canonical editorial data and revisions)
  -> GitHub App (not yet installed/configured)
  -> CMS branch and pull request
  -> human review and merge to main
  -> Astro static build and Pages deployment
~~~

The public Astro website remains static. Public readers do not query D1 or the Admin API.

## Implemented foundation

- Admin shell at /admin/.
- Pages Functions API under /api/admin/v1/.
- Cloudflare Access protection for Admin and Admin API routes.
- D1 CMS_DB as canonical content store.
- Content list/filtering, locale variants, draft save, revision history and sanitized preview in the implementation.
- Local D1 integration and browser tests in CI.

Production D1 contains 13 conceptual content items, 39 locale variants and 39 revision snapshots.

## Publication workflow and current blocker

The CMS is designed to create branches and pull requests for human review. It must not merge PRs or write directly to Main. The repository-scoped GitHub App is not yet installed/configured; its production settings are absent. Therefore publish/unpublish PR generation and media upload remain blocked on owner-side setup and subsequent production acceptance.

## Security

- Cloudflare Access authenticates the administrator.
- Pages Functions verify Access JWT identity, administrator role, Origin and CSRF for mutations.
- GitHub App credentials remain server-side only.
- Automated tests use local D1; no test may mutate production D1.

## Normative contracts and runbooks

- [CC-CONTENT-001 v1.2.0](../openspec/contracts/content-schema.md)
- [Admin API OpenAPI](../openspec/contracts/admin-api.openapi.yaml)
- [Implementation tasks](../openspec/changes/bilingual-admin-cms/tasks.md)
- [CMS local D1 runbook](../runbooks/cms-d1-local-development.md)
- [GitHub App publication setup](../runbooks/github-app-publication.md)
- [Administrator User Guide](../implementation/admin-user-guide.md)
