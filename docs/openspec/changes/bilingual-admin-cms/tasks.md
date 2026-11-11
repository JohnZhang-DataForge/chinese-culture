# Implementation Tasks and Exit Gates

**Change ID:** bilingual-admin-cms  
**Status (2026-11-12):** Main `26958755b749993bc30a8f3f578aec61efe7e09c`; PRs #61–#72 merged. Owner confirmed GitHub App ID `5712195`, Installation ID `180887271`, and Cloudflare dashboard evidence confirms `GITHUB_APP_PRIVATE_KEY` is saved as a Production Secret. Post-secret Pages deployment `2693bd16-214f-4337-8bcb-af5c0202c6db` matches Main. Main CI #43115514920 and Pages deployment/production smoke #43115515036 passed. Cloudflare Access read-back confirms `/admin`, `/admin/*`, `/api/admin` and `/api/admin/*` are covered by the designated administrator email policy. GitHub App installation scope/permissions and actual token issuance still require runtime verification. GitHub rulesets API remains empty. P1.8/P1.9, P6.9, P8.6–P8.9 and P8.10b remain open; P8.10b requires explicit owner approval. P3.5 remains open for final editorial sign-off. PR #12 remains an old draft and is not merge-ready.

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
- [ ] P3.5 Review Chinese terminology, cultural accuracy, links and language quality. First source-to-translation pass covered all 13 zh-CN articles; PR #58 corrected two fidelity/terminology issues. Internal links passed static verification; external sources were checked on 2026-11-11. Keep open for final editorial sign-off and any follow-up from a native-language review.
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
- [x] P5.10 Add keyboard, responsive and accessibility tests (PR #40 static checks plus Playwright Chromium coverage for content filtering, editor creation, draft save, keyboard focus and mobile navigation; PR #47 restores a passing accessible-name assertion; PR #48 verifies independent English, Simplified Chinese and Spanish preview switching).
- [x] P5.11 Hide or disable homepage settings, navigation settings and global media-library screens until their APIs are specified and implemented.

**Exit:** End-to-end browser workflow works against the D1-backed Agent 5 API in a non-production environment.

## P6 — QA and CI (Agent 6)

- [x] P6.1 Add content schema and translation-pair CI validation (`scripts/validate-content.mjs`, `tests/content-schema.test.mjs`, and the `validate:content` CI step). Legacy published Markdown keeps its established published-by-default behavior; locale folders, immutable IDs, route slugs, metadata types, media URLs/alt text and translation uniqueness/collection consistency are validated.
- [x] P6.2 Add OpenAPI lint and contract drift checks for API v1.2.0 (`redocly lint`, unique operationId validation, and a Pages Functions route/method parity check; PR #43 CI passed).
- [x] P6.3 Add clean-local-D1 migration and seed idempotency tests.
- [x] P6.4 Add D1 repository tests for CRUD, revision history and stale-write conflicts (PR #41 queries local D1 `content_revisions` and asserts both immutable snapshots; CI #42625364644 passed).
- [x] P6.5 Add Astro locale route, redirect, sitemap and draft-exclusion tests (unit coverage plus static build assertions).
- [x] P6.6 Add Pages Functions security and GitHub API mock/integration tests.
- [x] P6.7 Add media validation tests (PR #40 covers JPEG/PNG/WebP/AVIF signatures, malformed/truncated payloads, required alt/credit/license and HTTPS source URLs; CI #42624578839 passed).
- [x] P6.8 Add isolated Pages preview deployment/browser smoke tests (PR #51; preview run #42724399464 passed on `https://pr-51.chinese-culture-79h.pages.dev`; preview has no D1 binding or production vars, all three public locales pass, Admin is production-built/no-demo, and unauthenticated Admin API returns 401).
- [ ] P6.9 Add required PR status checks and protect main. Blocked: The repository is public. A read-only API query currently returns no repository rulesets; the connected integration cannot create rulesets or read branch-protection settings. The repository owner must configure a `main` ruleset in GitHub Settings → Rules → Rulesets. Do not treat public visibility alone as branch protection.
- [x] P6.10 Verify Wrangler Direct Upload bundles Pages Functions and applies CMS_DB without exposing secrets.
- [x] P6.11 Add a test that the production database is never used by automated test jobs.

**Exit:** All required CI checks pass on a clean PR and main branch policy requires them.

## P7 — Documentation (Agent 7)

- [x] P7.1 Update README and documentation index to reflect D1-backed editorial storage.
- [x] P7.2 Update architecture map, static hosting ADR references, repository map and authoring guide.
- [x] P7.3 Document D1 database ID/binding name, migration commands and local-only workflow; D1 Time Travel/export/restore runbook added. Native SQL dump download/import rehearsal remains pending.
- [x] P7.4 Document that src/content/ is generated publication output and D1 is canonical.
- [x] P7.5 Update operations runbooks and cost/limit monitoring guidance (`docs/operations/06-cost-and-limit-monitoring.md`; published Cloudflare limits documented; live account usage deliberately not inferred).
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
- [x] P8.10a Native SQL dump download/import/restore rehearsal passed in workflow #42726758673; 212,583-byte SQL dump downloaded on the GitHub runner, imported into a disposable US D1 database, exact table/locale counts and foreign keys verified, and the temporary database deleted. No dump artifact was retained.
- [ ] P8.10b Pages production rollback rehearsal remains pending. Read-only preflight recorded current/previous successful deployments in `docs/operations/05-d1-backup-and-restore.md`; the actual rollback changes the live production deployment pointer and requires explicit owner approval.

**Exit:** All proposal acceptance criteria are evidenced; only then mark this OpenSpec change complete.


### Latest production acceptance refresh — 2026-11-11

- PR #56 added the current Simplified Chinese editorial style guide aligned to CC-CONTENT-001 v1.2.0 and `zh-CN`; it is merged at Main `6763fa6faceff0ef5da6b62e3520d4f51e093c7c`.
- PR #56 CI #42921764286 passed `static-build` and `admin-browser`.
- Post-merge Main CI #42922241144 and Pages deployment #42922241177 passed; current production deployment is `b19551bd-4c07-422b-9600-2f99c0bc1697`.
- Current read-only Pages configuration still lists `CMS_DB` and the existing Access/admin variables, but no `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` or `GITHUB_APP_PRIVATE_KEY` production entries.
- GitHub repository rulesets API returns an empty list. P6.9 is not complete until an owner-configured ruleset is saved and verified.


### Post-PR #58/#59 content and privacy review — 2026-11-11

- Main: `420520645642c0f1f87f3036cb4e158601f5779b`.
- PR #58: first zh-CN article review corrections merged; CI #42923990182 and preview #42923990207 passed.
- PR #59: privacy notice clarified the distinction between public browsing and Cloudflare Access authentication cookies; CI #42924521557 and preview #42924521585 passed.
- Main CI #42924702981 and Pages deploy #42924702097 passed. Production deployment `c6c9de8d-5b80-477a-9b59-4d2a0fddc985` serves this Main SHA.
- Current content inventory is documented in `docs/content/06-content-inventory.md`; it records 13 concepts, 39 locale variants and the D1 canonical-source boundary.


### Latest production and documentation reconciliation — 2026-11-11

- PR #61 reconciled the README and core architecture/operations documents with the deployed multilingual static site and D1-backed Admin foundation.
- PR #62 added current Admin CMS architecture, GitHub integration, Admin user/content guides, credential setup and rollback procedure.
- PR #63 refreshed the production release evidence after PR #62.
- PR #64 documented the media workflow, rights metadata and the distinction between implemented code and pending production acceptance.
- PR #65 refreshed release evidence after PR #64 and is merged.
- Main `7730ac7712b2605bd6b20f6548d34d5116a9afd4`: Main CI #43017321316 passed both required jobs; Pages deployment #43017321253 passed.
- Production deployment `25642b9d-6ef5-4eb2-87c9-bf4dbc69aee9` was read back from Cloudflare and its commit SHA matches Main.
- The GitHub App's three Pages production settings remain absent. Owner-side GitHub App installation and Cloudflare secret configuration are required before authenticated production publishing tests.
- No repository rulesets are currently returned by GitHub's rulesets API. The owner must create the `main` ruleset and then have it re-read for verification.
- No production D1 mutation, media upload, content publication, rollback or credential change was performed during this documentation reconciliation.


### Post-PR #66 production and OpenSpec reconciliation — 2026-11-11

- PR #66 corrected the OpenSpec status, implementation status, documentation index, deployment evidence and change log after PR #65.
- PR #66 CI #43017652074 passed; PR #66 merged as Main `dccef68aea59177a5be66b01d1fe33baa484c91d`.
- Post-merge Main CI #43017852693 passed `static-build` and `admin-browser`; Pages deployment #43017852743 passed.
- Cloudflare production deployment `99b0a665-2653-4983-875a-b5cc36fa7589` was read back and its commit SHA matches Main.
- The production Pages deployment configuration still lacks the three GitHub App settings. Publication and media-upload production acceptance therefore remain blocked.
- GitHub repository rulesets API returned an empty list. The owner must create and verify the `main` ruleset.
- No production D1 mutation, media upload, publication, unpublication, rollback or secret change was performed.


### Post-PR #68 GitHub App token-scope hardening — 2026-11-11

- PR #68 explicitly restricts every GitHub App installation token request to the immutable repository ID for `JohnZhang-DataForge/chinese-culture` (`1444529252`), even if the App installation is later granted access to other repositories.
- The GitHub App unit test asserts the exact repository ID scope and minimum permission set.
- PR #68 CI #43020302625 passed both `static-build` and `admin-browser`; isolated Pages preview #43020302505 passed.
- PR #68 merged as Main `e55a21ed00bc25cc94560ee87c3fd310dda139cc`; Main CI #43020501355 and Pages deployment #43020502181 both passed.
- Cloudflare production deployment `9e850635-6a49-41a8-9629-fcfc6fdd8a3f` was read back and matches Main.
- The three production GitHub App settings remain absent; P1.8/P1.9 and production publication acceptance remain blocked on owner configuration.


### GitHub App credentials supplied — 2026-11-12

- Owner confirmed the GitHub App installation URL `https://github.com/organizations/JohnZhang-DataForge/settings/installations/180887271` and App ID `5712195`.
- Cloudflare Pages dashboard screenshot confirms `GITHUB_APP_PRIVATE_KEY` is saved as a Production Secret. The App ID and Installation ID were already configured in the production project. Secret contents were not accessed or exposed.
- Cloudflare's Pages project API omits encrypted secret values from environment-variable reads; the previous API-only check therefore did not establish that the secret was absent.
- Current successful Direct Upload deployment `e43b051c-0986-4523-b232-1a1aff817682` predates the secret addition. Cloudflare rejects the deployment retry endpoint for Direct Upload deployments. The next normal Pages deployment must load the new runtime secret.
- GitHub App installation token issuance and authenticated Admin session acceptance have not yet been verified. P1.8 remains open until repository scope/permissions and token issuance are verified.


### Production App secret and smoke acceptance refresh — 2026-11-12

- Owner supplied App ID `5712195` and Installation ID `180887271`; screenshot confirms `GITHUB_APP_PRIVATE_KEY` is saved as a Production Secret. The private key value was not read or exposed.
- Cloudflare Access application `Chinese Culture Admin` was read back; protected domains include `chinese-culture.site/admin`, `/admin/*`, `/api/admin` and `/api/admin/*`, with an Allow policy restricted to the designated administrator email.
- PR #70 documented the App configuration; PR #71 updated public smoke checks to use the immutable Pages deployment URL; PR #72 adjusted unauthenticated checks for Cloudflare edge 401/403 denials. All three merged.
- Main `26958755b749993bc30a8f3f578aec61efe7e09c`; Main CI #43115514920 passed `static-build` and `admin-browser`; Pages deployment and production smoke #43115515036 passed.
- Production deployment `2693bd16-214f-4337-8bcb-af5c0202c6db` matches Main and is aliased to the apex and www domains.
- P1.8 remains open until the App installation repository scope/permissions and installation-token issuance are verified. Authenticated Admin CRUD, media, publish and unpublish acceptance remain pending.
