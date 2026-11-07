# Proposal: Bilingual Website and D1-backed Admin CMS

**Change ID:** bilingual-admin-cms  
**Owner:** Agent 0 — Chief Architect and Integration Lead  
**Status:** Proposed — D1 persistence architecture amendment  
**Target domain:** https://chinese-culture.site

## Why

The repository currently contains a static Astro website and an Admin CMS frontend draft. The original CMS proposal used GitHub branches as the only content store. The project owner has now requested a real database-backed editor so that website text can be created, changed, saved and recovered through the browser.

This amendment replaces the GitHub-only content persistence decision with Cloudflare D1 as the authoritative editorial database. It preserves the current static-first public website and the existing Cloudflare Pages Direct Upload deployment. GitHub remains the code repository, review workflow and source of generated public-content snapshots; it is no longer the primary place where editors author or save content.

## Outcomes

1. Readers can use the public website in English, Simplified Chinese and Spanish.
2. Every translated page has a stable shared content identity and a clear language counterpart.
3. Authorized editors can create, edit, preview, save and submit content using a browser CMS.
4. Cloudflare D1 stores the authoritative content records, including passage text, metadata, locale variants, draft state and revision history.
5. The Admin UI reads and writes content through authenticated Pages Functions; browser code never receives database credentials or GitHub credentials.
6. GitHub stores application source, D1 migrations, media assets and generated publication snapshots. Generated snapshots are reviewable release artifacts, not the editorial source of truth.
7. Publishing and unpublishing remain PR-based: the CMS exports the selected D1 revision to a CMS branch, creates or updates a PR, and a human-authorized merge triggers the existing Pages deployment.
8. Public reading remains static-first. Visitors do not need a D1 query or Pages Function invocation to read ordinary pages.
9. The website continues to run on Cloudflare Pages Free without an always-on Node.js server or an SSR migration.

## In scope

- Locale-aware Astro routes for en, zh-CN and es.
- One shared content schema and one Admin API contract.
- Cloudflare D1 as the canonical store for conceptual content items, locale variants, Markdown bodies, editorial metadata, draft state and revision history.
- D1 migrations checked into the repository and local D1 development/test support.
- Import of existing website content into D1 and preservation of stable content IDs and slugs.
- A browser Admin CMS with content list, editor, translation status, Markdown preview, media upload and publishing actions.
- Cloudflare Access protection for admin pages and API routes.
- A Cloudflare Pages Functions Admin API that verifies Access JWTs, enforces roles/CSRF and uses the D1 binding.
- A least-privilege GitHub App used server-side only to export D1 revisions into CMS branches and create/update PRs.
- Static publication snapshots generated from D1 and consumed by the Astro build.
- Automated schema, database, security, contract, browser and deployment checks.

## Out of scope

- Public user registration, reader accounts, comments, social login for readers or learning-progress tracking.
- Newsletter subscriptions, payments, ticketing, event registration or public content submission.
- External SQL services, KV, Durable Objects or a second database.
- A public runtime content API or database reads for ordinary public-page rendering.
- Astro SSR, a separate Worker deployment or an always-on Node.js server.
- R2 as the primary media store in this increment. Media remains in the private GitHub repository and is deployed as static assets; D1 stores media metadata.
- Global media-library search, homepage configuration and navigation/site-settings editing until their APIs are specified.
- Hard deletion of published content. Published content is removed from public output through the reviewed unpublish workflow and retained in D1 revision history and Git history.
- Direct CMS writes to main, automatic PR merging or bypass of required checks.

## Normative requirements

### Public localization

- **LOC-001:** The site SHALL support locale identifiers en, zh-CN and es.
- **LOC-002:** Public URLs SHALL use /en/, /zh-cn/ and /es/ prefixes, including the default English locale.
- **LOC-003:** The root URL / SHALL lead to the English landing page while preserving an explicit language-selection affordance.
- **LOC-004:** Existing unprefixed public routes SHALL redirect to their equivalent /en/ routes. Existing content slugs SHALL remain stable during the initial migration.
- **LOC-005:** Each localized page SHALL emit correct lang, canonical and alternate hreflang metadata.
- **LOC-006:** A language switch SHALL resolve the counterpart by contentId, not by assuming the two locale slugs are equal.
- **LOC-007:** If a translation is not published, the UI SHALL not link to a broken or draft public route.

### Content model

- **CNT-001:** Every conceptual article SHALL have an immutable contentId shared by all its language variants.
- **CNT-002:** Each language variant SHALL have its own locale, slug, title, description, body and publication state.
- **CNT-003:** The schema in contracts/content-schema.md SHALL be the only agreed content schema.
- **CNT-004:** Valid editorial states SHALL be draft, published and unpublished. featured SHALL be an independent boolean.
- **CNT-005:** The public Astro build SHALL include only published records from the generated snapshot committed to main.
- **CNT-006:** Featured content SHALL be eligible for public featured placements only when status is published and featured is true.
- **CNT-007:** Unpublishing SHALL retain the D1 record and revision history while removing the page from the next public build.
- **CNT-008:** A contentId/locale pair SHALL be unique; a slug SHALL be unique within a collection and locale.
- **CNT-009:** D1 SHALL be the authoritative editorial source. Files under src/content/ SHALL be generated publication snapshots and SHALL NOT be treated as the editable source of truth.

### Database and persistence

- **DB-001:** The CMS SHALL use the provisioned Cloudflare D1 database named chinese-culture-cms, with binding name CMS_DB and database ID 8b6f6c98-06fe-49eb-adbc-690d4b57c058.
- **DB-002:** D1 SHALL store conceptual items, locale-specific variants, full Markdown body text, metadata, status, timestamps and current revision.
- **DB-003:** D1 SHALL retain content revision snapshots and publication submission metadata so edits can be audited and recovered.
- **DB-004:** D1 schema changes SHALL be implemented as ordered SQL migrations under database/migrations/; no manual-only production schema changes are allowed.
- **DB-005:** All database reads and writes SHALL use prepared statements and bounded result sets. No endpoint may accept arbitrary SQL.
- **DB-006:** Mutations SHALL use optimistic concurrency with a monotonically increasing D1 revision. A stale If-Match value SHALL return 409 and SHALL NOT overwrite newer content.
- **DB-007:** Existing content SHALL be imported through a repeatable, idempotent seed/import process. Re-running the import SHALL NOT duplicate content or overwrite newer editorial revisions.
- **DB-008:** The local/test environment SHALL use a local D1 database and migrations. Automated tests SHALL NOT write to the production database.
- **DB-009:** Database backup and restore instructions SHALL be documented and tested before production CMS acceptance.

### Admin security

- **SEC-001:** Admin pages and Admin API SHALL be protected by Cloudflare Access.
- **SEC-002:** The Pages Functions middleware SHALL independently verify the Cloudflare Access JWT signature, issuer, audience, expiry and identity.
- **SEC-003:** The Pages Functions middleware SHALL enforce an explicit administrator/editor allowlist or role mapping.
- **SEC-004:** D1 access SHALL be available only through the server-side CMS_DB binding. No database credentials or unrestricted database API may reach the browser.
- **SEC-005:** GitHub App credentials SHALL remain in Pages Functions secrets. No GitHub token or private key may reach browser code, HTML, local storage or logs.
- **SEC-006:** Mutations SHALL validate request origin, CSRF protection, input schema, media type, media size and path safety.
- **SEC-007:** The GitHub App SHALL have only repository metadata read, contents read/write and pull-request read/write permissions required for snapshot publication.
- **SEC-008:** Security-relevant actions SHALL be auditable through D1 revision records, Git commits, PR history and structured request logs without logging secrets or full content bodies.

### CMS and publishing

- **CMS-001:** Authorized users SHALL be able to list, create, read and edit content variants stored in D1.
- **CMS-002:** The CMS SHALL provide a preview of unsaved Markdown and metadata without making drafts public.
- **CMS-003:** The CMS SHALL support creation of a translation variant using the existing contentId.
- **CMS-004:** Save Draft SHALL persist the complete variant and a revision snapshot in D1.
- **CMS-005:** Submit for review SHALL export the selected D1 revision to a CMS-owned GitHub branch and create or update a PR to main.
- **CMS-006:** Publish SHALL export a snapshot with status published. The page becomes public only after the PR is merged and Pages deployment succeeds.
- **CMS-007:** Unpublish SHALL export a snapshot with status unpublished. The page disappears from public output only after the PR is merged and Pages deployment succeeds.
- **CMS-008:** No endpoint SHALL merge a PR or bypass GitHub branch protection.
- **CMS-009:** The CMS SHALL show the D1 revision, GitHub branch, PR URL, checks and publication state.
- **CMS-010:** Published or unpublished content SHALL NOT be hard-deleted through the CMS. Draft deletion is permitted only when no open submission depends on it.
- **CMS-011:** The database status represents the requested editorial state; the public live state is confirmed by the corresponding merged PR/deployment, not by saving a D1 row alone.

### Platform and deployment

- **PLT-001:** The public site SHALL remain Astro static output on the existing Cloudflare Pages project.
- **PLT-002:** Admin operations SHALL execute in Cloudflare Pages Functions under /api/admin/v1/*, deployed with the existing Wrangler Direct Upload workflow.
- **PLT-003:** The Pages Functions runtime SHALL bind the D1 database as CMS_DB.
- **PLT-004:** The public website SHALL not require a Pages Function invocation or D1 query for normal reading.
- **PLT-005:** A merge to main SHALL trigger build, validation and Pages deployment.
- **PLT-006:** CI SHALL validate content schema, D1 migrations, seed idempotency, translation relationships, public route output, API contract compatibility and Pages Functions tests.
- **PLT-007:** Secrets and private documentation SHALL never be included in dist/.

## Acceptance criteria

The release is accepted only when all of the following are demonstrated:

1. The /en/, /zh-cn/ and /es/ home pages render with correct language metadata.
2. Existing English content and reviewed Chinese and Spanish translations are present in D1 with stable content IDs and locale-specific slugs.
3. D1 migrations can create the complete schema in a clean local database.
4. The import/seed process is idempotent and preserves existing content.
5. An authenticated editor can create a content item, edit its text, save it, reload it from D1 and see the same content.
6. An editor can create and edit the other locale variant using the same contentId.
7. A stale revision returns 409 and does not overwrite another editor's newer revision.
8. Draft and unpublished records are absent from generated public HTML, sitemap and featured modules.
9. Submitting a D1 revision creates or updates a CMS PR containing the exact generated snapshot; the API does not merge it.
10. A human-authorized PR merge to main publishes the expected static page through Pages.
11. Unpublish removes the page from the next public build while retaining the D1 record and revision history.
12. An unauthenticated request to /admin/ and /api/admin/v1/* is denied.
13. An authenticated but unauthorized user is denied; an allowed administrator can use the CMS.
14. Browser bundles and network responses contain no D1 credential, GitHub App private key or installation token.
15. Media upload validates file signatures and rights metadata; media files remain static assets.
16. The public site passes responsive, keyboard, screen-reader, link, SEO, security-header and browser smoke tests.
17. D1 backup/export and restore procedures are documented and a restore test is evidenced.
18. The implementation uses the existing Pages Free deployment and does not introduce an unapproved paid service or always-on server.

## Dependencies and assumptions

- The existing Cloudflare Pages project is chinese-culture and uses Wrangler Direct Upload.
- Cloudflare D1 database chinese-culture-cms has been provisioned in the US jurisdiction. Database ID: 8b6f6c98-06fe-49eb-adbc-690d4b57c058.
- The Pages project currently has no Functions enabled; the D1 binding and Pages Functions will be activated through the reviewed Wrangler configuration/deployment.
- Cloudflare Access is available and configured for the production domain.
- A GitHub App can be installed only on JohnZhang-DataForge/chinese-culture with restricted permissions.
- The repository owner can enable main-branch protection and required status checks.
- The existing Pages deployment token is stored as a protected GitHub Actions secret. It must not be copied into source.
- The initial media size limit is 8 MiB per file and allowed formats are JPEG, PNG, WebP and AVIF. SVG is excluded.
- The CMS initially supports a small, explicitly allowlisted editor group.
- D1 Free limits and pricing can change. Keep public traffic static, monitor actual D1 usage and re-check current Cloudflare limits before launch.

## Delivery phases

1. **P0 — Contract amendment:** approve D1 persistence, update the Admin API contract and publish the new ownership/implementation sequence.
2. **P1 — Database and identity foundation:** bind the provisioned D1 database, add migrations/local development, configure Access and GitHub App.
3. **P2 — Bilingual public frontend:** locale routes, metadata, language switch, compatibility redirects and generated-snapshot filtering.
4. **P3 — Content migration:** stable IDs, English import, Chinese and Spanish translations, and idempotent D1 seed.
5. **P4 — Admin backend:** Pages Functions authentication, D1 CRUD/revisions, media handling, D1-to-GitHub snapshot export and PR operations.
6. **P5 — Admin frontend:** dashboard, editor, translation management, preview, media and PR state.
7. **P6 — QA and hardening:** CI gates, D1 migration/seed tests, contract tests, security tests, browser/a11y testing and recovery drills.
8. **P7 — Integration and release:** ordered PR merges, production deployment, database binding verification and acceptance report.

Parallel work is allowed only after the relevant contract is marked Ready. See contracts/agent-ownership.md and contracts/integration-protocol.md.
