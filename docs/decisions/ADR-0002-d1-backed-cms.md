# ADR-0002: D1-backed Editorial Content with Static Publication Snapshots

**Status:** Proposed  
**Owner:** Agent 0 — Chief Architect and Integration Lead  
**Date:** 2026-11-06

## Context

The initial Chinese Culture Atlas MVP used Markdown files in GitHub as both the editorial source and the static-site build input. That was appropriate for the first static website but does not provide the requested browser-based editing experience or a relational content database.

The project owner has requested an Admin CMS that can change website text and persist the content in a database. The existing Astro static site and Cloudflare Pages Direct Upload project should remain in place; a permanently running server or a public runtime database dependency is not required.

## Decision

Use Cloudflare D1 as the authoritative editorial content database. Store conceptual content items, locale variants, Markdown body text, metadata, desired publication state, revision history and CMS submission state in D1.

Use Pages Functions under the existing Pages project for authenticated CMS operations. Bind the D1 database as CMS_DB. Protect both the Admin UI and API with Cloudflare Access and verify the Access JWT again in the application middleware.

Keep the public website static. When an editor submits a revision for review, publish, or unpublish, the Pages Functions API exports that exact D1 revision to a generated Markdown snapshot on a CMS-owned GitHub branch and opens/updates a PR. A human-authorized merge to main triggers the existing Astro build and Pages deployment.

GitHub remains the source repository for application code, database migrations, generated public snapshots, media assets and release review history. GitHub snapshots are generated artifacts; D1 remains the canonical editable source.

## Provisioned database

- Name: chinese-culture-cms
- Binding: CMS_DB
- Database ID: 8b6f6c98-06fe-49eb-adbc-690d4b57c058
- Jurisdiction: us
- Cloudflare-reported primary region: ENAM
- Read replication: disabled

The database has been provisioned but has no application tables yet. Schema creation must occur through reviewed SQL migrations.

## Consequences

### Positive

- Editors can save and reload content without committing every draft to Git.
- D1 provides relational constraints, indexed queries and revision-aware updates.
- Public readers continue to receive static HTML without a D1 read or Pages Function invocation.
- Publishing remains reviewable and does not bypass main-branch protection.
- If GitHub snapshot export or a PR fails, the canonical D1 record remains available for retry.
- Database schema and operational commands remain versioned with the application.

### Tradeoffs

- The system must maintain a D1-to-GitHub snapshot export path.
- D1 revision state and the currently deployed public snapshot are separate states and must be shown clearly in the Admin UI.
- D1 migrations, backup/export and restore procedures become production responsibilities.
- Pages Functions consume Workers Free request quota; keep them limited to CMS/API traffic and monitor actual usage.
- Media files remain Git-backed for the first release; R2 is deferred.

## Alternatives considered

1. **GitHub-only CMS:** rejected because it does not meet the explicit database-backed editing requirement.
2. **D1 as a cache while GitHub remains the editable source:** rejected because it creates two competing content sources and confusing save semantics.
3. **Dynamic public pages reading D1 on every request:** rejected for this increment because it weakens the current static-first delivery and makes normal reading depend on database/API availability.
4. **External SQL or an always-on Node.js service:** rejected because it adds unnecessary operational and cost overhead for this site.

## Required controls

- D1 migrations are ordered and applied through reviewed release operations.
- Local and automated tests use local/test D1 databases, never production.
- Every content mutation uses a revision check and appends an audit snapshot.
- All SQL values are parameterized; no raw SQL endpoint is exposed.
- Snapshot export records the exact D1 revision in the PR.
- The CMS cannot write directly to main or merge PRs.
- D1 backup/export and restore instructions are tested before production acceptance.
