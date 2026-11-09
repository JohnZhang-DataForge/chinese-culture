# Implementation Tasks and Exit Gates

**Change ID:** bilingual-admin-cms  
**Status (2026-11-09):** PR #39 is merged. Latest Main `601e36d9605e406a0fdc57dde2004aafd53bd183` was deployed successfully (Pages run #42621971861); follow-up production smoke/CI for the sitemap and multilingual 404 plus stale-write conflict coverage passed on `bb74ecabfe23399e1ec2983f01face1853064ba8` (CI #42622578083; Pages #42622578025). Production D1 remains 13 content items, 39 published variants (13 per locale), 39 revisions, 0 submissions and no FK violations. Current remaining gates: repository-scoped GitHub App installation/secrets and reviewed publish/unpublish acceptance, authenticated production CRUD, direct revision-history assertion, media validation tests (PR in progress), accessibility/browser tests, main branch protection, native SQL dump restore and Pages rollback.

## P0 — Architecture and contract freeze (Agent 0)

- [x] P0.1 Approve D1 as the canonical editorial content store and GitHub as generated snapshot/review storage.
- [x] P0.2 Freeze locale URL contract and legacy redirect policy.
- [x] P0.3 Freeze CC-CONTENT-001 v1.2.0 with en, zh-CN and es locale variants, legacy cover-image fields and D1 mapping.
- [x] P0.4 Update Admin API OpenAPI to v1.2.0 with D1 revision/ETag semantics.
- [x] P0.5 Freeze Cloudflare Access + Pages Functions + CMS_DB + GitHub App snapshot-export design.
- [x] P0.6 Update agent ownership, integration order and migration/rollback rules.
- [x] P0.7 Merge the architecture/contracts PR after CI and review pass (included in CMS integration PR #33).

**Exit:** Agents 1–7 receive the exact contract versions and may begin only their assigned files.

## P1 — Database and identity foundation

Production D1 is provisioned, migrated and populated. Bootstrap run #42531011592 passed; direct D1 checks confirmed 13 content items, 39 locale variants and 39 revision snapshots. Cloudflare Access policy and administrator/CSRF settings are configured.

### Agent 5 — D1 and backend foundation
- [x] P1.1 Verify the provisioned D1 database chinese-culture-cms and bind it as CMS_DB using database ID 8b6f6c98-06fe-49eb-adbc-690d4b57c058.
- [x] P1.2 Update wrangler.jsonc without changing the existing Pages project, output directory or compatibility date unnecessarily.
- [x] P1.3 Add ordered SQL migrations under database/migrations/.
- [x] P1.4 Document Wrangler local D1 state and validate migrations with --local; no remote preview database ID is used.
- [x] P1.5 Configure one exact-email Cloudflare Access policy covering /admin/* and /api/admin/* destinations.
- [x] P1.6 Configure ADMIN_EMAIL and ADMIN_CSRF_SECRET as production Pages variables/secrets and enforce the exact administrator role.
- [x] P1.7 Verify Access JWT validation and deny-by-default behavior.

### Agent 0 — GitHub App integration approval
- [ ] P1.8 Install and verify the GitHub App only on JohnZhang-DataForge/chinese-culture with minimum Contents, Pull Requests and Checks permissions.
- [ ] P1.9 Verify the main-branch PR/check gate and no-bypass policy. The App has no Administration permission and the CMS code has no merge endpoint, but GitHub's `Pull requests: write` permission technically includes the merge API; branch rules must enforce the human-review workflow (see `docs/runbooks/github-app-publication.md`).

**Exit:** D1 binding and local migrations work; unauthenticated CMS access is denied; GitHub App can write only to CMS branches and create/update PRs.

## P2 — Public multilingual frontend (Agent 2)

The static frontend serves English, Simplified Chinese and Spanish route trees. ContentId-based locale matching, legacy redirects, published-only rendering, sitemap generation and missing-translation fallbacks are implemented.

- [x] P2.1 Implement /en/, /zh-cn/ and /es/ route generation.
- [x] P2.2 Implement shared locale-aware layout and navigation.
- [x] P2.3 Implement language switch by contentId (PR #35 merged and deployed; CI verifies canonical, hreflang and switch destinations for all 39 locale variants).
- [x] P2.4 Add lang, canonical, hreflang and x-default metadata.
- [x] P2.5 Add redirects from existing unprefixed URLs (verified in `public/_redirects`; production smoke confirms `www` → apex).
- [x] P2.6 Keep public rendering static and consume only generated src/content/ snapshots on main.
- [x] P2.7 Filter all public routes, sitemap and featured modules to status=published (legacy Markdown defaults to published; CMS publication snapshots write explicit `status: published`).
- [x] P2.8 Add missing-translation states and multilingual 404 behavior (language menu explains unavailable article translations and falls back to the corresponding section; 404 selects English, Simplified Chinese or Spanish by route locale, then browser language).
- [x] P2.9 Preserve existing visual design and accessibility.

**Exit:** Localized routes and static build tests pass with schema-valid published snapshots; no public D1/API dependency exists.

## P3 — Content migration and translation (Agent 3)

- [x] P3.1 Inventory all existing English Markdown and assign immutable contentIds.
- [x] P3.2 Preserve existing English slugs and all source text during migration.
- [x] P3.3 Populate required schema fields and editorial/source metadata.
- [x] P3.4 Prepare Simplified Chinese translations linked by the same contentIds.
- [ ] P3.5 Review Chinese terminology, cultural accuracy, links and language quality.
- [x] P3.6 Produce an idempotent source-driven importer at scripts/import-content-to-d1.mjs; it preserves the existing 39 Markdown variants and derives stable contentIds.
- [x] P3.7 Produce a translation coverage report; mark missing translations explicitly.
- [x] P3.8 Verify every seed record against the shared schema and duplicate constraints.

**Exit:** The seed dataset passes schema/relationship checks and can be imported without duplicate rows or overwriting newer revisions.

## P4 — Admin backend and security (Agent 5)

- [x] P4.1 Implement Pages Functions routes under functions/api/admin/v1/ and shared middleware under functions/api/admin/_middleware.js.
- [x] P4.2 Implement Access JWT, issuer/audience/signature/expiry and role checks.
- [x] P4.3 Implement CSRF, Origin, request validation and RFC 9457 errors.
- [x] P4.4 Implement D1 repository layer using prepared statements and bounded queries.
- [x] P4.5 Implement create/list/read/update/translation operations backed by D1.
- [x] P4.6 Implement atomic revision history and optimistic concurrency; stale If-Match returns 409.
- [x] P4.7 Implement the idempotent seed/import tool for Agent 3's approved dataset.
- [x] P4.8 Implement preview response with sanitized HTML.
- [x] P4.9 Implement secure media upload as a reviewed GitHub PR; attach media metadata to D1 only after merge.
- [x] P4.10 Implement D1-to-Markdown snapshot export for the exact requested revision.
- [x] P4.11 Implement review/publish/unpublish PR generation. D1 status changes only after a reviewed PR merges and the explicit POST sync endpoint records the publication transition; never merge or write main.
- [x] P4.12 Implement read-only GET PR status lookup plus an explicit CSRF-protected POST sync endpoint; GET requests never mutate D1.
- [x] P4.13 Add backend unit, integration, permission, migration, concurrency and abuse tests.
- [x] P4.14 Document D1 export, restore and recovery procedures (runbook added; native SQL dump download/import rehearsal remains a separate acceptance gate).

**Exit:** Contract tests pass; CRUD round-trips through D1; stale-write, unauthorized, oversized-media, migration and GitHub-failure cases are demonstrated.

## P5 — Admin frontend (Agent 4)

- [x] P5.1 Rebase the existing Admin UI draft against the latest main and consume Admin API v1.2.0.
- [x] P5.2 Build protected Admin shell and session/role handling.
- [x] P5.3 Build content list, filters and translation coverage indicators using D1-backed API results.
- [x] P5.4 Build Markdown editor and metadata form from the shared schema.
- [x] P5.5 Implement safe preview using the API preview response.
- [x] P5.6 Implement language variant creation and editing.
- [x] P5.7 Implement Save Draft to D1 and reload-after-save behavior.
- [x] P5.8 Implement media upload and accessible metadata entry.
- [x] P5.9 Implement submit-review/publish/unpublish actions and show D1 revision, PR, checks and live state.
- [ ] P5.10 Add keyboard, responsive and accessibility tests.
- [x] P5.11 Hide or disable homepage settings, navigation settings and global media-library screens until their APIs are specified and implemented.

**Exit:** End-to-end browser workflow works against the D1-backed Agent 5 API in a non-production environment.

## P6 — QA and CI (Agent 6)

- [ ] P6.1 Add content schema and translation-pair CI validation.
- [ ] P6.2 Add OpenAPI lint and contract drift checks for API v1.2.0.
- [x] P6.3 Add clean-local-D1 migration and seed idempotency tests.
- [ ] P6.4 Add D1 repository tests for CRUD, revision history and stale-write conflicts (CRUD and stale `If-Match` rejection now run in Pages Functions integration CI; direct `content_revisions` row assertion remains).
- [x] P6.5 Add Astro locale route, redirect, sitemap and draft-exclusion tests (unit coverage plus static build assertions).
- [x] P6.6 Add Pages Functions security and GitHub API mock/integration tests.
- [ ] P6.7 Add media validation tests.
- [ ] P6.8 Add preview deployment/browser smoke tests.
- [ ] P6.9 Add required PR status checks and protect main.
- [x] P6.10 Verify Wrangler Direct Upload bundles Pages Functions and applies CMS_DB without exposing secrets.
- [x] P6.11 Add a test that the production database is never used by automated test jobs.

**Exit:** All required CI checks pass on a clean PR and main branch policy requires them.

## P7 — Documentation (Agent 7)

- [x] P7.1 Update README and documentation index to reflect D1-backed editorial storage.
- [x] P7.2 Update architecture map, static hosting ADR references, repository map and authoring guide.
- [x] P7.3 Document D1 database ID/binding name, migration commands and local-only workflow; D1 Time Travel/export/restore runbook added. Native SQL dump download/import rehearsal remains pending.
- [x] P7.4 Document that src/content/ is generated publication output and D1 is canonical.
- [ ] P7.5 Update operations runbooks and cost/limit monitoring guidance.
- [x] P7.6 Record actual CI, Cloudflare binding, Access and Pages deployment evidence.

**Exit:** No documentation says that the CMS is GitHub-only or that the deployed project has no Functions/D1 after those capabilities are verified.

## P8 — Integration and release (Agent 0)

The production Pages project deploys Functions and CMS_DB. PR #35 is merged and deployed. Production D1 import and direct read-back verified (13 items, 39 variants, 39 revisions; all locale groups complete; no FK violations). Main workflows #42538125290 (Pages), #42538125227 (D1 migration/import) and #42538125223 (CI) all succeeded. GitHub App setup, authenticated Admin CRUD, reviewed media/publication acceptance and native SQL dump restore remain release gates.

- [x] P8.1 Re-read latest main and all open PRs; update each PR against current main for PRs #33 and #34.
- [x] P8.2 Review file ownership, contracts, tests, security and deployment compatibility for the merged CMS implementation.
- [x] P8.3 Merge in dependency order documented in integration-protocol.md (PR #33, importer fix PR #34, then contentId/locale routing PR #35).
- [x] P8.4 Verify Pages production deployment includes the Pages Functions API and CMS_DB binding (deployment run #42538125290 succeeded; project retains custom domains and production branch main).
- [x] P8.5 Verify production locale routes and domain redirects: six public routes returned HTTP 200 with expected language; `www.chinese-culture.site` returned HTTP 301 to apex; follow-up smoke #42622578025 also verified public sitemap and localized 404 pages.
- [ ] P8.6 Run authenticated production Admin content create/edit/save/reload/translation/preview smoke tests (database import and read-only SQL validation passed; browser/API mutation acceptance remains pending).
- [ ] P8.7 Submit a test publish PR, merge it through normal review, and verify the static page is live.
- [ ] P8.8 Submit a test unpublish PR and verify route removal while D1 history remains.
- [ ] P8.9 Verify draft/unpublished exclusion, translation switching, SEO and accessibility.
- [ ] P8.10 Native SQL dump download/import test and Pages rollback remain pending; the isolated row-level D1 restore rehearsal passed. The export API produced a signed URL, but the execution environment could not download the SQL bytes (HTTP 403), so native dump restore is not claimed.

**Exit:** All proposal acceptance criteria are evidenced; only then mark this OpenSpec change complete.
