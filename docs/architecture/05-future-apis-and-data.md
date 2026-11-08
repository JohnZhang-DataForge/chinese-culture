# Future APIs, Data Models and Integrations

**Status:** D1-backed private editorial API is implemented in the CMS integration; other public APIs remain future design only.

## Implemented CMS boundary

The public website remains static. A private, authenticated Cloudflare Pages Functions API under `/api/admin/v1/` supports editorial CRUD, translation variants, revision history, safe preview, reviewed media upload and GitHub PR publication. Cloudflare D1 (`CMS_DB`) is the canonical editorial store. GitHub Markdown files on `main` are generated publication snapshots, not the editing database.

The API is protected by Cloudflare Access, verified Access JWT identity, exact administrator role, same-origin checks and identity-bound CSRF tokens. The browser never receives a GitHub credential. A repository-scoped GitHub App is required for branch/PR operations; the code is ready, but production App credentials are a manual setup gate.

See:
- [Content schema contract](../openspec/contracts/content-schema.md)
- [Admin API OpenAPI](../openspec/contracts/admin-api.openapi.yaml)
- [Local D1 runbook](../runbooks/cms-d1-local-development.md)
- [GitHub App setup](../runbooks/github-app-publication.md)

## Cloudflare Free runtime boundary

Normal article and learning page requests must remain static. Only authenticated editorial operations invoke Pages Functions and D1. Avoid turning public page rendering into per-request database queries. Revalidate current Workers/Pages/D1 limits and costs before adding new workloads.

## Candidate future resources

- **Events:** searchable event details, dates, organizer and venue; a dedicated editorial collection and route contract are still required.
- **Newsletter:** opt-in subscription state, double opt-in and unsubscribe.
- **Feedback:** moderated corrections and editorial questions.
- **Learning progress:** user-specific data, only if accounts deliver a clear learning benefit.
- **Catalog search:** read-only indexed content if local static search becomes insufficient.

## Future OpenAPI approach

Any new public or internal endpoint must be designed before implementation. Document resources, operations, field types, authentication, validation errors, pagination, privacy-sensitive data, abuse limits, examples and API versioning. Keep schemas and documentation under reviewed Git history.

## Data and privacy

Store the least possible personal data. Do not add anonymous visitor identities, location tracking or registration data merely to improve analytics. Set retention and deletion policies before collecting anything.

## Decision gate

No new public API, account system or background job starts until an ADR approves the feature, threat model, estimated monthly spend and operational owner.
