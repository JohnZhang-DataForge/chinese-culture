# Technology Selection — Static Public Site and Private CMS

**Status:** Accepted and implemented in production · **Updated:** 2026-11-11

## Current stack

| Component | Selection | Role |
|---|---|---|
| Content framework | Astro 5, static output | Pre-renders public article and locale routes |
| Build runtime | Node.js 22 in GitHub Actions | Content validation, tests and static generation |
| Static hosting | Cloudflare Pages Free | Public HTML, CSS, JS and media |
| Private server-side endpoints | Cloudflare Pages Functions | Authenticated Admin API only |
| Editorial database | Cloudflare D1 (`CMS_DB`) | Canonical content, locale variants, revisions and submissions |
| Authentication | Cloudflare Access + Pages Functions JWT/role/CSRF checks | Protects the Admin workspace and API |
| Source/review | GitHub repository and human-reviewed PRs | Stores source code and generated publication snapshots |
| Publication integration | Repository-scoped GitHub App | Designed, but production installation/secrets remain pending |

## Architectural boundary

Normal public page requests remain static and do not invoke D1 or Admin APIs. Dynamic Pages Functions are used only for protected editorial operations. Do not convert public article rendering to SSR or per-request database queries without a new ADR, cost review and privacy review.

Node.js is a build-time runtime, not an always-on production server. Cloudflare Pages serves the generated static output.

## Free-tier constraints

The current project is designed to keep ordinary public asset delivery static. Pages Functions consume Workers quota; D1 operations and storage have separate limits. Revalidate current official Cloudflare limits and pricing before adding workload or changing the architecture. See [Cloudflare cost and limit monitoring](../operations/06-cost-and-limit-monitoring.md).

## Deferred capabilities

A public event submission system, newsletter, reader accounts, personalization, public APIs and background jobs remain out of scope until an ADR approves the feature, threat model, data retention, operational owner and budget.

## Related contracts

- [CC-CONTENT-001](../openspec/contracts/content-schema.md)
- [Admin API OpenAPI](../openspec/contracts/admin-api.openapi.yaml)
- [Cloudflare Pages architecture](04-deployment-and-environments.md)
- [ADR-0004 — no always-on Node server](../decisions/ADR-0004-no-always-on-node-server.md)
