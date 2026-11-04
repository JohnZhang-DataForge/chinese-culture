# Implementation Tasks and Exit Gates

**Change ID:** bilingual-admin-cms  
**Status:** All implementation tasks pending contract approval unless separately evidenced in a PR.

## P0 — Architecture and contract freeze (Agent 0)

- [ ] P0.1 Review proposal and agree scope/non-goals.
- [ ] P0.2 Freeze locale URL contract and legacy redirect policy.
- [ ] P0.3 Freeze shared content schema and migration layout.
- [ ] P0.4 Freeze OpenAPI 3.1 Admin API contract and RFC 9457 error shape.
- [ ] P0.5 Freeze Cloudflare Access + Pages Functions + GitHub App security design.
- [ ] P0.6 Publish ownership matrix and integration protocol.
- [ ] P0.7 Merge the architecture/contracts PR after CI and review pass.

**Exit:** Agents 1–7 receive the exact contract version and may begin only their assigned files.

## P1 — Domain and identity foundation

### Agent 1 — domain/DNS
- [ ] P1.1 Verify domain registrar ownership and current DNS records.
- [ ] P1.2 Verify Cloudflare zone and Pages project association.
- [ ] P1.3 Attach chinese-culture.site as the Pages custom domain.
- [ ] P1.4 Configure apex DNS and HTTPS; decide whether www redirects to apex.
- [ ] P1.5 Verify certificate issuance, DNS propagation and canonical redirect.
- [ ] P1.6 Record exact changes and rollback procedure.

### Agent 5 — security/backend
- [ ] P1.7 Create and install least-privilege GitHub App.
- [ ] P1.8 Configure Cloudflare Access policy for /admin/* and /api/admin/*.
- [ ] P1.9 Configure Pages Functions secrets and role mapping without committing secrets.
- [ ] P1.10 Verify Access JWT validation and deny-by-default behavior.

**Exit:** Domain is reachable over HTTPS; unauthenticated CMS access is denied; GitHub App can access only required repository operations.

## P2 — Public bilingual frontend (Agent 2)

- [ ] P2.1 Implement /en/ and /zh-cn/ route generation.
- [ ] P2.2 Implement shared locale-aware layout and navigation.
- [ ] P2.3 Implement language switch by contentId.
- [ ] P2.4 Add lang, canonical, hreflang and x-default metadata.
- [ ] P2.5 Add redirects from existing unprefixed URLs.
- [ ] P2.6 Filter all public routes, sitemap and featured modules to status=published.
- [ ] P2.7 Add missing-translation states and bilingual 404 behavior.
- [ ] P2.8 Preserve existing visual design and accessibility.

**Exit:** Localized routes and route compatibility tests pass with schema-valid sample records.

## P3 — Content migration and translation (Agent 3)

- [ ] P3.1 Assign immutable contentIds to all existing content.
- [ ] P3.2 Move existing English Markdown into locale-aware paths without changing English slugs.
- [ ] P3.3 Populate required schema fields and editorial/source metadata.
- [ ] P3.4 Produce Simplified Chinese translations linked by the same contentIds.
- [ ] P3.5 Review Chinese terminology, cultural accuracy, links and language quality.
- [ ] P3.6 Produce a translation coverage report; mark missing translations explicitly.
- [ ] P3.7 Verify every file against the shared schema and duplicate constraints.

**Exit:** Migration PR passes content schema and translation-link checks. Do not claim complete bilingual coverage until all required launch content is translated and reviewed.

## P4 — Admin backend and security (Agent 5)

- [ ] P4.1 Implement Pages Functions routes under functions/api/admin/v1/ and shared middleware under functions/api/admin/_middleware.js.
- [ ] P4.2 Implement Access JWT, issuer/audience/signature/expiry and role checks.
- [ ] P4.3 Implement CSRF, Origin, request validation and RFC 9457 errors.
- [ ] P4.4 Implement GitHub App installation-token exchange and secret handling.
- [ ] P4.5 Implement list/read/create/update/translation operations.
- [ ] P4.6 Implement CMS branch creation, commits and optimistic concurrency.
- [ ] P4.7 Implement preview response with sanitized HTML.
- [ ] P4.8 Implement secure media upload and metadata response.
- [ ] P4.9 Implement submit-review, publish and unpublish PR operations.
- [ ] P4.10 Add backend unit, integration, permission and abuse tests.
- [ ] P4.11 Verify the Pages Functions API never writes to main or merges PRs.

**Exit:** Contract tests pass; unauthorized, stale-write, oversized-media and GitHub-failure cases are demonstrated.

## P5 — Admin frontend (Agent 4)

- [ ] P5.1 Build protected Admin shell and session/role handling.
- [ ] P5.2 Build content list, filters and translation coverage indicators.
- [ ] P5.3 Build Markdown editor and metadata form from the shared schema.
- [ ] P5.4 Implement safe preview using the API preview response.
- [ ] P5.5 Implement language variant creation and editing.
- [ ] P5.6 Implement media upload and accessible metadata entry.
- [ ] P5.7 Implement save draft and submit-review/publish/unpublish actions.
- [ ] P5.8 Display revision SHA, PR link, checks and publication status.
- [ ] P5.9 Add keyboard, responsive and accessibility tests.

**Exit:** End-to-end browser workflow works against the Agent 5 API in a non-production environment.

## P6 — QA and CI (Agent 6)

- [ ] P6.1 Add content schema and translation-pair CI validation.
- [ ] P6.2 Add OpenAPI lint and contract drift checks.
- [ ] P6.3 Add Astro locale route, redirect, sitemap and draft-exclusion tests.
- [ ] P6.4 Add Pages Functions security and GitHub API mock/integration tests.
- [ ] P6.5 Add media validation tests.
- [ ] P6.6 Add preview deployment/browser smoke tests.
- [ ] P6.7 Add required PR status checks and protect main.
- [ ] P6.8 Verify Wrangler Direct Upload bundles the Pages Functions directory and keeps secrets out of source.

**Exit:** All required CI checks pass on a clean PR and main branch policy requires them.

## P7 — Documentation (Agent 7)

- [ ] P7.1 Update README and documentation index to reflect actual bilingual/CMS architecture.
- [ ] P7.2 Update repository map, content authoring guide and localization guide.
- [ ] P7.3 Document Access, GitHub App, Pages Functions secret setup without exposing values.
- [ ] P7.4 Document CMS user guide and editorial publishing lifecycle.
- [ ] P7.5 Document media rights/alt text policy and upload constraints.
- [ ] P7.6 Document domain, DNS, Pages/Functions deployment and rollback.
- [ ] P7.7 Reconcile stale statements in existing status and deployment docs.
- [ ] P7.8 Publish release evidence and known limitations.

**Exit:** Documentation matches merged code and verified Cloudflare/GitHub state.

## P8 — Integration and production acceptance (Agent 0 + all agents)

- [ ] P8.1 Re-read latest main and all open PRs; update each PR against current main.
- [ ] P8.2 Review file ownership, contracts, tests, security and deployment compatibility.
- [ ] P8.3 Merge in dependency order documented in integration-protocol.md.
- [ ] P8.4 Verify Pages production deployment includes the Pages Functions API.
- [ ] P8.5 Verify chinese-culture.site and canonical redirects.
- [ ] P8.6 Run bilingual route, CMS auth, content edit, media, preview, PR publish and unpublish smoke tests.
- [ ] P8.7 Verify draft/unpublished exclusion, translation switching, SEO and accessibility.
- [ ] P8.8 Test rollback and write final production acceptance report.

**Exit:** All proposal acceptance criteria are evidenced; only then mark this OpenSpec change complete.
