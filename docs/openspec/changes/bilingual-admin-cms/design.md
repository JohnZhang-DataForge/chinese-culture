# Architecture and Design: Bilingual Website + D1-backed Admin CMS

**Change ID:** bilingual-admin-cms  
**Status:** Proposed; implementation must follow the contracts in docs/openspec/contracts/.

## 1. Design principles

- Preserve the current Astro 5 public website, visual identity and static output.
- Use Cloudflare D1 as the canonical editorial database for text and metadata.
- Keep public pages statically generated and cacheable; public readers do not query D1.
- Use Cloudflare Access for identity enforcement and Pages Functions for server-side authorization and D1 access.
- Use GitHub as the source-code repository, media asset store, generated publication snapshot and human review/audit workflow.
- Keep one shared content schema and one OpenAPI contract across agents.
- Never allow a CMS browser session to write directly to main or merge a PR.
- Keep database migrations and import tooling versioned in the repository.
- Do not expose drafts, unpublished content or private source material through public build output.

## 2. Logical topology

~~~text
Reader
  |
  v
https://chinese-culture.site
  |
  v
Cloudflare Pages — Astro static HTML/CSS/JS
  |
  +--> /en/* and /zh-cn/*
  |
  +--> generated published snapshots under src/content/
       (no D1 query for ordinary page reads)

Editor
  |
  v
Cloudflare Access policy (email/group allowlist)
  |
  +--> /admin/*             protected static Admin UI
  |
  +--> /api/admin/v1/*      protected Pages Functions
                                |
                                v
                         Access JWT verification
                         role + CSRF + origin checks
                                |
                   +------------+-------------+
                   |                          |
                   v                          v
             Cloudflare D1               GitHub App
             CMS_DB binding              short-lived token
                   |                          |
                   v                          v
             Canonical content            CMS branch
             items + variants             generated snapshot
             revisions + submissions      + media assets
                                              |
                                              v
                                       Pull request -> review
                                              |
                                           merge main
                                              |
                                              v
                                      GitHub Actions
                                      Astro build + verify
                                              |
                                              v
                                      Wrangler Pages deploy
~~~

The Pages project uses Direct Upload. The existing Wrangler deployment must bundle the root functions/ directory and apply the CMS_DB binding. The public Pages assets and Pages Functions are deployed together; the public pages remain static.

## 3. Runtime boundaries

### Public site

Astro builds all public routes at build time from the generated content snapshot in src/content/. Only records with status=published are emitted. The public site does not query D1 or the Admin API for normal rendering. This preserves static asset caching, SEO metadata and the current no-runtime-database cost profile for readers.

### Admin UI

The Admin UI is a static Astro route under /admin/. It is not secret merely because it is hidden; authorization is enforced at the Cloudflare Access edge and again by the Pages Functions API. The UI stores only short-lived display state and the CSRF token in memory. It does not store D1 credentials, GitHub tokens or private keys.

### Admin API (Pages Functions)

Implement the API under functions/api/admin/v1/ with shared middleware at functions/api/admin/_middleware.js. The existing Pages Direct Upload workflow runs Wrangler from the repository root. The Wrangler configuration must include the D1 binding and the Pages output directory. Keep Astro output static; do not add SSR or a separate Worker deployment.

The Pages Functions runtime:
- Verifies CF-Access-Jwt-Assertion using the configured Access issuer/JWKS.
- Checks issuer, audience, signature, exp/nbf and verified identity.
- Maps the verified identity to a configured role.
- Validates Origin and CSRF token for mutations; does not enable wildcard CORS.
- Uses the CMS_DB D1 binding for content, revision and submission records.
- Uses prepared statements and bounded queries; never accepts arbitrary SQL from clients.
- Obtains short-lived GitHub App installation tokens server-side only when exporting a snapshot or reading PR state.
- Writes generated snapshots and approved media assets only to CMS-owned branches, then creates/updates PRs.
- Enforces input limits, the shared content schema and optimistic concurrency.
- Returns RFC 9457 Problem Details for failures.

## 4. D1 data model

The D1 database is provisioned:

| Property | Value |
|---|---|
| Database name | chinese-culture-cms |
| Binding name | CMS_DB |
| Database ID | 8b6f6c98-06fe-49eb-adbc-690d4b57c058 |
| Jurisdiction | us |
| Primary region reported by Cloudflare | ENAM |
| Read replication | disabled |

The initial schema is maintained as ordered SQL migrations under database/migrations/. The logical tables are:

### content_items

One row per conceptual item:
- content_id: immutable UUID primary key.
- collection: lessons, culture, festivals, books or events.
- created_at: ISO timestamp.

### content_variants

One row per locale variant:
- content_id and locale form the unique key and reference content_items.
- slug, title, description, SEO title/description and category.
- body_markdown stores the full editable passage text.
- status, featured, updated_at and published_at.
- order, reading_minutes, level, chinese and pinyin where applicable.
- tags_json, sources_json and media_json for the contract-defined arrays.
- revision is a monotonically increasing integer used for optimistic concurrency.

A unique index enforces collection + locale + slug. Additional indexes support collection, locale and status filters used by the Admin UI and export.

### content_revisions

An append-only revision history:
- content_id, locale and revision.
- actor identity or stable actor hash.
- snapshot_json containing the validated content variant at that revision.
- created_at.

Revision history is not a substitute for the current variant row; it supports audit, conflict investigation and recovery.

### cms_submissions

One row per publication submission:
- submission_id, content_id and locale.
- D1 revision and intent (review, publish or unpublish).
- GitHub branch and PR number.
- PR state, created_at, updated_at and merged_at.

This table links a saved D1 revision to its generated GitHub publication snapshot. A PR being merged does not change the canonical source from D1 to GitHub.

### Database rules

- All user-controlled values are bound parameters.
- Mutations update the variant and append the revision snapshot atomically using a D1 batch/transaction pattern.
- An update succeeds only when the stored revision matches If-Match; otherwise return 409.
- No client can choose a table name, submit SQL or bypass schema validation.
- Pagination is bounded and deterministic.
- D1 production access is available only to Pages Functions and authorized operational tooling.

## 5. Identity and authorization

### Edge policy

Cloudflare Access protects:
- https://chinese-culture.site/admin/*
- https://chinese-culture.site/api/admin/*

Only named editor/admin identities or an explicitly approved Access group can enter. The public site remains accessible without Access.

### Application verification

The Pages Functions middleware must not trust the edge policy alone. It verifies the signed JWT in CF-Access-Jwt-Assertion against Cloudflare's public signing keys. Required checks include:
- Expected issuer for the configured Access team.
- Expected audience for this application policy.
- Valid signature and supported algorithm.
- Not expired; not before current time.
- Non-empty verified identity.
- Role mapping from a server-side allowlist/configuration.

Initial roles:
- **admin:** all CMS operations, including submit publish/unpublish PRs.
- **editor:** create/edit/translate/preview/upload and submit review PRs.
- **reader:** no CMS API access; public-site access only.

The MVP may initially allow only one admin identity. Do not infer roles from user-controlled request fields.

### CSRF and browser constraints

Because Access may authenticate with browser cookies, every mutation must require:
- Exact Origin equal to the configured production origin.
- Sec-Fetch-Site same-origin where available.
- A valid X-CSRF-Token returned by GET /session and bound to the verified identity/expiry.
- Expected Content-Type and method.
- No permissive CORS response.

The Pages Functions middleware should use a short-lived signed CSRF token or another reviewed double-submit design. GET requests must not mutate state.

## 6. GitHub App and publication snapshots

Create a GitHub App installed only on JohnZhang-DataForge/chinese-culture. Minimum permissions:
- Metadata: read.
- Contents: read and write.
- Pull requests: read and write.
- Checks/statuses: read only if needed to display PR status.

No Actions administration, secrets administration, workflow write, issues write or repository administration permission is required for the content workflow.

Store App ID, installation ID and private key as Pages Functions secrets. The Pages Functions runtime signs a short-lived App JWT, exchanges it for an installation access token and keeps the token only in server-side ephemeral memory until expiry. Never return it to the browser or include it in logs.

### Source-of-truth boundary

- D1 is the canonical editorial source for content text, metadata, status and revisions.
- The GitHub branch is a generated publication snapshot for a specific D1 revision.
- src/content/ on main is the current static snapshot consumed by Astro; it is generated and must not be manually edited as the CMS source.
- Git history and PR review provide release history and human approval, while D1 retains the complete editable record and revision history.

### Snapshot flow

1. An editor saves a draft or metadata change. The API validates and persists it to D1.
2. The editor selects review, publish or unpublish.
3. The API reads the exact D1 revision and serializes the contract fields to the appropriate Markdown file under src/content/{collection}/{locale}/.
4. The API writes that snapshot and any referenced media to a CMS-owned branch using the GitHub App.
5. The API creates or updates a PR to main. The PR body records contentId, locale, D1 revision, intent and editorial checklist.
6. CI validates the generated snapshot and static build. No automatic merge is allowed.
7. A human-authorized merge to main triggers the existing Pages deployment.
8. The Admin UI obtains the PR state and displays whether that submitted revision is merged. A newer D1 revision is not considered live merely because an older PR merged.

If a PR is closed or a deployment fails, the D1 record remains available for correction and resubmission.

## 7. Content lifecycle

### Draft

- The CMS writes the variant and a revision snapshot to D1.
- The D1 status is draft.
- No public snapshot is changed and no draft is generated into public routes, sitemap or featured modules.
- The CMS can read it back and render a private preview.

### Review

- Submit for review exports the current D1 revision with status=draft to a CMS branch.
- The PR body records the exact D1 revision.
- CI validates schema, translation linkage, Markdown, links and static build.
- No automatic merge is allowed.

### Publish

- The CMS changes the D1 desired status to published, sets publishedAt, appends a new revision, then exports that exact revision with status=published to the CMS branch.
- A human reviewer reviews the final diff and checks.
- Only a permitted merge to main triggers the Pages deployment.
- A page is live only after the corresponding PR is merged and the Pages deployment succeeds.

### Unpublish

- The CMS changes the D1 desired status to unpublished, retains the historical publishedAt value, appends a new revision, then exports that exact revision with status=unpublished.
- The PR review and merge process is the same as publishing.
- The next public build removes the route and any featured placement.
- The source record and revision history remain in D1; the generated snapshot remains in Git history.

### Featured

featured is independent of status. A featured record with draft or unpublished status is never rendered publicly. The frontend must always apply both conditions.

## 8. Media upload

MVP media storage remains Git-backed under public/media/<contentId>/. The Admin API accepts multipart/form-data with a file and metadata.

Allowed file types:
- image/jpeg
- image/png
- image/webp
- image/avif

Maximum size: 8 MiB per file. SVG and HTML are rejected. The Pages Functions API validates actual file signatures rather than trusting the browser Content-Type, generates a safe filename, prevents path traversal and commits the asset to the current CMS branch. The response includes the committed path, public URL, content type, size and blob SHA. The corresponding rights/accessibility metadata is saved in D1 with the content revision.

Each use of an image in content must have meaningful alt text and a rights record (original, licensed with terms, public domain with evidence, or other documented permission). Do not accept uploads without alt text or rights classification.

R2 is not required for this release. If image volume or repository size becomes a real constraint, propose a separate storage ADR.

## 9. Routing and SEO

- Locale prefix: /en/ or /zh-cn/.
- Section names remain stable across locales: learn, culture, festivals, books, events.
- Slugs may be localized independently.
- Root / redirects to /en/.
- Existing unprefixed routes redirect to /en/ equivalents.
- Canonical URLs point to the localized page.
- hreflang alternates are emitted only for published translations.
- x-default points to the English equivalent when it exists.
- Sitemap contains only published localized routes.
- The language switch uses contentId mapping, never slug substitution.
- Missing translations are visibly identified; never silently display an English page under a zh-CN URL.

## 10. API and concurrency

The API contract is contracts/admin-api.openapi.yaml. Its base path is /api/admin/v1. Agents 4 and 5 must generate/validate against that single contract.

Mutations use an opaque ETag derived from the current D1 revision. If-Match is required for existing variants. A stale revision returns 409 Conflict with current revision information. Do not silently retry a conflicting overwrite.

The Pages Functions API maps application operations to D1 and GitHub:
- Read, list, create and update content from D1.
- Append an immutable D1 revision record for every successful mutation.
- Create/update a CMS branch and commit the generated Markdown/media snapshot only when the editor submits a review/publish/unpublish action.
- Create/update a PR to main.
- Read PR/check status and reconcile the corresponding submission record.
- Never merge the PR or write content directly to main.

## 11. Error handling, backup and observability

All API errors use application/problem+json following RFC 9457 with a stable application code and requestId. Never expose stack traces, D1 internals, GitHub private details, Access tokens or repository credentials.

Log requestId, route, authenticated actor identifier (email or pseudonymous hash), action, contentId, locale, D1 revision, result and GitHub object identifiers. Do not log content bodies, media bytes, cookies, JWTs, private keys or installation tokens.

Use D1 Time Travel for the plan's supported recovery window and document the current plan limits. Provide a repeatable SQL export and restore procedure using Wrangler. Test restore against a separate local/test database before production acceptance. Do not run restore commands against production as part of routine tests.

## 12. CI and release

Required checks before merge:
- Astro build and static verifier.
- Content schema and translation-pair validation.
- D1 migration apply against a clean local database.
- Idempotent content import/seed tests.
- D1 repository tests for create, update, revision and stale-write conflicts.
- Locale route and redirect tests.
- Pages Functions unit/security tests.
- OpenAPI lint and frontend/backend contract tests.
- Media upload validation tests.
- Accessibility/link/SEO smoke tests.

The Pages workflow deploys only after main receives a reviewed merge. Pages Functions and the D1 binding are deployed with the existing Pages Direct Upload workflow through Wrangler. The same reviewed main merge deploys static assets and the API functions together; function secrets remain separately scoped.

## 13. Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Draft content leaks | Public build uses only generated status=published snapshots; tests assert draft/unpublished absent |
| D1 and static snapshot drift | Every snapshot records the D1 revision in its PR; only the matching merged submission is shown as live |
| Concurrent edits overwrite each other | Monotonic D1 revision, If-Match and 409 conflict handling |
| Database migration damages content | Ordered migrations, local/test validation, export/restore runbook and backup checks |
| GitHub publication integration fails | D1 remains canonical; failed/closed PRs can be corrected and resubmitted |
| GitHub credential exposure | GitHub App private key and tokens are Pages Functions secrets only |
| Unauthorized CMS access | Access edge policy plus Pages Functions JWT verification and role checks |
| Malicious media upload | MIME signature checks, strict allowlist, 8 MiB limit, SVG rejected |
| PR merge bypass | Pages Functions have no merge endpoint; main protection and required checks |
| Existing links break | Legacy redirects and route compatibility tests |
| Cloudflare cost grows unexpectedly | Static public pages, admin-only D1/Functions execution, bounded queries and usage monitoring |
| Documentation becomes stale | Agent 7 updates status/change log; Agent 0 signs off integration |

## 14. Explicit architectural decisions

1. **Static-first remains:** Astro Pages stays static; no SSR migration.
2. **D1 is canonical:** all editable passage text and editorial metadata live in D1.
3. **Pages Functions API:** Admin endpoints execute as Pages Functions and are deployed with the existing Pages Direct Upload workflow.
4. **GitHub snapshots:** GitHub branches/PRs hold generated publication snapshots and media, not the authoritative editable content.
5. **Cloudflare Access:** no custom public login or session database.
6. **GitHub App:** no browser PAT and no direct browser-to-GitHub writes.
7. **Locale-prefixed URLs:** /en and /zh-cn.
8. **Git-backed media first:** R2 is deferred.
9. **PR-based publishing:** no automatic merge or direct main write.
10. **Shared contracts:** OpenAPI and content schema are owned by Agent 0.
