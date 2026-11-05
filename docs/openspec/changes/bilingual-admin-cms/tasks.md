# Implementation Tasks and Exit Gates

**Change ID:** bilingual-admin-cms  
**Status:** D1 persistence amendment proposed; implementation starts after the updated contracts are merged.

## P0 — Architecture and contract freeze (Agent 0)

- [ ] P0.1 Approve D1 as the canonical editorial content store and GitHub as generated snapshot/review storage.
- [ ] P0.2 Freeze locale URL contract and legacy redirect policy.
- [ ] P0.3 Keep CC-CONTENT-001 v1.1.0 as the content object schema; document its D1 mapping.
- [ ] P0.4 Update Admin API OpenAPI to v1.2.0 with D1 revision/ETag semantics.
- [ ] P0.5 Freeze Cloudflare Access + Pages Functions + CMS_DB + GitHub App snapshot-export design.
- [ ] P0.6 Update agent ownership, integration order and migration/rollback rules.
- [ ] P0.7 Merge the architecture/contracts PR after CI and review pass.

**Exit:** Agents 1–7 receive the exact contract versions and may begin only their assigned files.

## P1 — Database and identity foundation

### Agent 5 — D1 and backend foundation
- [ ] P1.1 Verify the provisioned D1 database chinese-culture-cms and bind it as CMS_DB using database ID 8b6f6c98-06fe-49eb-adbc-690d4b57c058.
- [ ] P1.2 Update wrangler.jsonc without changing the existing Pages project, output directory or compatibility date unnecessarily.
- [ ] P1.3 Add ordered SQL migrations under database/migrations/.
- [ ] P1.4 Define local D1 preview configuration and document that Pages local development uses local D1 state, not the remote production database.
- [ ] P1.5 Configure Cloudflare Access policy for /admin/* and /api/admin/*.
- [ ] P1.6 Configure Pages Functions secrets and role mapping without committing secret values.
- [ ] P1.7 Verify Access JWT validation and deny-by-default behavior.

### Agent 0 — GitHub App integration approval
- [ ] P1.8 Verify the GitHub App is installed only on JohnZhang-DataForge/chinese-culture with the minimum Contents and Pull Requests permissions.
- [ ] P1.9 Confirm the App cannot merge PRs, change branch protection or write directly to main.

**Exit:** D1 binding and local migrations work; unauthenticated CMS access is denied; GitHub App can write only to CMS branches and create/update PRs.

## P2 — Public bilingual frontend (Agent 2)

- [ ] P2.1 Implement /en/ and /zh-cn/ route generation.
- [ ] P2.2 Implement shared locale-aware layout and navigation.
- [ ] P2.3 Implement language switch by contentId.
- [ ] P2.4 Add lang, canonical, hreflang and x-default metadata.
- [ ] P2.5 Add redirects from existing unprefixed URLs.
- [ ] P2.6 Keep public rendering static and consume only generated src/content/ snapshots on main.
- [ ] P2.7 Filter all public routes, sitemap and featured modules to status=published.
- [ ] P2.8 Add missing-translation states and bilingual 404 behavior.
- [ ] P2.9 Preserve existing visual design and accessibility.

**Exit:** Localized routes and static build tests pass with schema-valid published snapshots; no public D1/API dependency exists.

## P3 — Content migration and translation (Agent 3)

- [ ] P3.1 Inventory all existing English Markdown and assign immutable contentIds.
- [ ] P3.2 Preserve existing English slugs and all source text during migration.
- [ ] P3.3 Populate required schema fields and editorial/source metadata.
- [ ] P3.4 Prepare Simplified Chinese translations linked by the same contentIds.
- [ ] P3.5 Review Chinese terminology, cultural accuracy, links and language quality.
- [ ] P3.6 Produce an idempotent seed dataset under database/seeds/ for Agent 5's importer.
- [ ] P3.7 Produce a translation coverage report; mark missing translations explicitly.
- [ ] P3.8 Verify every seed record against the shared schema and duplicate constraints.

**Exit:** The seed dataset passes schema/relationship checks and can be imported without duplicate rows or overwriting newer revisions.

## P4 — Admin backend and security (Agent 5)

- [ ] P4.1 Implement Pages Functions routes under functions/api/admin/v1/ and shared middleware under functions/api/admin/_middleware.js.
- [ ] P4.2 Implement Access JWT, issuer/audience/signature/expiry and role checks.
- [ ] P4.3 Implement CSRF, Origin, request validation and RFC 9457 errors.
- [ ] P4.4 Implement D1 repository layer using prepared statements and bounded queries.
- [ ] P4.5 Implement create/list/read/update/translation operations backed by D1.
- [ ] P4.6 Implement atomic revision history and optimistic concurrency; stale If-Match returns 409.
- [ ] P4.7 Implement the idempotent seed/import tool for Agent 3's approved dataset.
- [ ] P4.8 Implement preview response with sanitized HTML.
- [ ] P4.9 Implement secure media upload to the CMS branch and store metadata in D1.
- [ ] P4.10 Implement D1-to-Markdown snapshot export for the exact requested revision.
- [ ] P4.11 Implement submit-review, publish and unpublish PR operations; never merge or write main.
- [ ] P4.12 Implement PR status lookup and submission-state reconciliation.
- [ ] P4.13 Add backend unit, integration, permission, migration, concurrency and abuse tests.
- [ ] P4.14 Document D1 export, restore and recovery procedures.

**Exit:** Contract tests pass; CRUD round-trips through D1; stale-write, unauthorized, oversized-media, migration and GitHub-failure cases are demonstrated.

## P5 — Admin frontend (Agent 4)

- [ ] P5.1 Rebase the existing Admin UI draft against the latest main and consume Admin API v1.2.0.
- [ ] P5.2 Build protected Admin shell and session/role handling.
- [ ] P5.3 Build content list, filters and translation coverage indicators using D1-backed API results.
- [ ] P5.4 Build Markdown editor and metadata form from the shared schema.
- [ ] P5.5 Implement safe preview using the API preview response.
- [ ] P5.6 Implement language variant creation and editing.
- [ ] P5.7 Implement Save Draft to D1 and reload-after-save behavior.
- [ ] P5.8 Implement media upload and accessible metadata entry.
- [ ] P5.9 Implement submit-review/publish/unpublish actions and show D1 revision, PR, checks and live state.
- [ ] P5.10 Add keyboard, responsive and accessibility tests.
- [ ] P5.11 Hide or disable homepage settings, navigation settings and global media-library screens until their APIs are specified and implemented.

**Exit:** End-to-end browser workflow works against the D1-backed Agent 5 API in a non-production environment.

## P6 — QA and CI (Agent 6)

- [ ] P6.1 Add content schema and translation-pair CI validation.
- [ ] P6.2 Add OpenAPI lint and contract drift checks for API v1.2.0.
- [ ] P6.3 Add clean-local-D1 migration and seed idempotency tests.
- [ ] P6.4 Add D1 repository tests for CRUD, revision history and stale-write conflicts.
- [ ] P6.5 Add Astro locale route, redirect, sitemap and draft-exclusion tests.
- [ ] P6.6 Add Pages Functions security and GitHub API mock/integration tests.
- [ ] P6.7 Add media validation tests.
- [ ] P6.8 Add preview deployment/browser smoke tests.
- [ ] P6.9 Add required PR status checks and protect main.
- [ ] P6.10 Verify Wrangler Direct Upload bundles Pages Functions and applies CMS_DB without exposing secrets.
- [ ] P6.11 Add a test that the production database is never used by automated test jobs.

**Exit:** All required CI checks pass on a clean PR and main branch policy requires them.

## P7 — Documentation (Agent 7)

- [ ] P7.1 Update README and documentation index to reflect D1-backed editorial storage.
- [ ] P7.2 Update architecture map, static hosting ADR references, repository map and authoring guide.
- [ ] P7.3 Document D1 database ID/binding name, migration commands, local-only test workflow and backup/restore.
- [ ] P7.4 Document that src/content/ is generated publication output and D1 is canonical.
- [ ] P7.5 Update operations runbooks and cost/limit monitoring guidance.
- [ ] P7.6 Record actual CI, Cloudflare binding, Access and Pages deployment evidence.

**Exit:** No documentation says that the CMS is GitHub-only or that the deployed project has no Functions/D1 after those capabilities are verified.

## P8 — Integration and release (Agent 0)

- [ ] P8.1 Re-read latest main and all open PRs; update each PR against current main.
- [ ] P8.2 Review file ownership, contracts, tests, security and deployment compatibility.
- [ ] P8.3 Merge in dependency order documented in integration-protocol.md.
- [ ] P8.4 Verify Pages production deployment includes the Pages Functions API and CMS_DB binding.
- [ ] P8.5 Verify chinese-culture.site and canonical redirects.
- [ ] P8.6 Run D1-backed content create/edit/save/reload/translation/preview smoke tests.
- [ ] P8.7 Submit a test publish PR, merge it through normal review, and verify the static page is live.
- [ ] P8.8 Submit a test unpublish PR and verify route removal while D1 history remains.
- [ ] P8.9 Verify draft/unpublished exclusion, translation switching, SEO and accessibility.
- [ ] P8.10 Test D1 backup/export/restore and Pages rollback; write the final production acceptance report.

**Exit:** All proposal acceptance criteria are evidenced; only then mark this OpenSpec change complete.
