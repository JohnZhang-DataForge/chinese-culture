# Integration, PR Review and Production Acceptance Protocol

**Owner:** Agent 0  
**Applies to:** Agents 1–7  
**Default branch:** main

## 1. Branch and repository rules

- Integration branch: agent/00-integration.
- Every feature agent uses agent/<number>-<short-scope> or a clearly named feature branch.
- Start from the latest main SHA, not from an old feature branch or an agent's local stale branch.
- Do not push directly to main.
- Do not force-push shared branches.
- Do not commit secrets, Access JWTs, GitHub App private keys, installation tokens or Cloudflare API tokens.
- A PR must target main and include the agent ownership declaration.
- Update against latest main before final review. If a branch diverged, inspect and resolve conflicts without overwriting another agent's work.
- The old feat/astro-cloudflare-free-mvp branch is divergent from the inspected main baseline; it is historical only and is not an integration base.

## 2. Contract freeze and change control

Shared contracts:
- CC-CONTENT-001 v1.0.0: contracts/content-schema.md.
- Admin API OpenAPI 3.1.0 v1.0.0: contracts/admin-api.openapi.yaml.
- Locale URL contract: proposal.md and design.md.

Agents 2/3 and 4/5 must consume the exact versions above. If an implementation requirement conflicts:
1. Stop only the affected interface work.
2. Open a contract-change request with current contract, problem, proposed change, migration impact and affected agents.
3. Agent 0 reviews and updates the canonical contract.
4. Agent 0 announces the new version and affected agents.
5. Consumers update code/tests against the new version.

Do not make a private extension and expect another agent to discover it.

## 3. PR requirements

Each PR must:
- Have a single coherent responsibility and respect file ownership.
- Link the OpenSpec task IDs.
- State contract versions consumed.
- Include a concise before/after summary.
- Include tests, CI links and runtime/browser evidence where applicable.
- Update relevant documentation through Agent 7.
- Include migration/rollback notes for routes, schema, DNS, Access, secrets or deployment changes.
- Contain no unrelated formatting or broad refactoring.
- Confirm no direct write to main and no merge bypass.

## 4. Agent 0 review checklist

### Architecture
- Does it preserve Astro static output for public routes?
- Is Admin API isolated to the Pages Functions routes while public pages remain static?
- Are public pages independent of Admin API availability?
- Is the existing design preserved?
- Are locale prefixes, legacy redirects and translation lookup consistent?

### Content
- Does each variant satisfy CC-CONTENT-001?
- Are contentId/locale pairs unique?
- Do translation variants share the same contentId?
- Are drafts/unpublished absent from pages, search, sitemap and featured modules?
- Are all published media assets rights-cleared and accessible?

### API and security
- Does implementation match OpenAPI without undocumented fields/paths?
- Is Access JWT cryptographically verified in the Pages Functions middleware?
- Are issuer, audience, signature, expiry and role checked?
- Are mutations protected by CSRF and exact Origin validation?
- Are GitHub App credentials server-only?
- Are optimistic concurrency and 409 behavior implemented?
- Are errors RFC 9457 and do they avoid leaking secrets?
- Is the API unable to write main or merge PRs?

### Quality and operations
- Do all required checks pass?
- Are mobile/keyboard/screen-reader/browser checks evidenced?
- Are domain/DNS/HTTPS and canonical redirects verified?
- Are Pages static assets and Pages Functions deployed together through the intended Wrangler workflow?
- Is rollback documented and exercised?
- Are docs and current status accurate?

## 5. Recommended merge order

1. **Agent 0 — contracts:** merge the OpenSpec/contracts PR after documentation/structure checks.
2. **Agent 6 — CI foundations:** add contract lint, schema validation scaffolding and required check names. Do not make the checks permanently required until they exist and have passed at least once.
3. **Agent 5 — security/backend foundation:** Pages Functions routes, Access JWT validation, GitHub App auth, error/CSRF middleware and API tests.
4. **Agent 2 — public locale framework:** locale config, routing, layout, language switch, redirects and status filtering.
5. **Agent 3 — content migration:** merge after Agent 2 confirms the target content path/schema implementation is ready. Agent 2 and Agent 3 may develop in parallel after contract freeze, but migration should merge only when frontend route support exists.
6. **Agent 4 — Admin UI:** merge after backend endpoints are available in a test environment or a contract-faithful mock. Agent 4 and Agent 5 may develop in parallel.
7. **Agent 1 — domain/DNS:** complete and verify custom domain before production acceptance. DNS changes are not a code PR; record evidence and rollback.
8. **Agent 6 — final QA:** enable required checks, branch protection and all end-to-end gates after feature branches have stabilized.
9. **Agent 7 — docs:** reconcile all existing documentation with merged implementation and real deployment state.
10. **Agent 0 — final integration:** review cross-agent compatibility, merge only after all required checks and repository policies pass, then coordinate production verification.

If a dependency is blocked, do not merge a broken stub merely to preserve the order. Keep independent PRs open and report the blocking condition.

## 6. Merge policy

- A passing CI run is necessary but not sufficient.
- Agent 0 approves architecture compatibility; repository branch protection and authorized human review remain authoritative.
- No PR is merged while required checks are pending or failing.
- No PR is merged if the head SHA changed after review; re-check the current diff and checks.
- Prefer squash merge for isolated agent PRs unless repository policy or history requirements dictate otherwise.
- Main branch must require PRs and required status checks before feature integration begins. The inspected baseline reported main as unprotected; Agent 6 must coordinate enabling protection with the repository owner.
- The Admin API must never merge PRs. Publishing is a reviewed GitHub merge, not an API side effect.

## 7. Release sequence

1. Confirm latest main SHA and merged PR list.
2. Confirm all CI checks pass on the exact main SHA.
3. Confirm Pages production deployment succeeds.
4. Verify Pages Functions are bundled in the Pages deployment and configure their secrets with least-privilege access.
5. Verify Access policies and unauthenticated denial.
6. Verify custom domain HTTPS, apex/www policy and canonical URL.
7. Verify English and Chinese home/collection/detail pages.
8. Verify language switching and hreflang.
9. Verify a draft remains private and absent from public routes.
10. Verify preview rendering and media upload with rights metadata.
11. Verify submit-for-review creates a PR and does not merge.
12. Merge a test publish PR through the normal review/check process; verify Pages publishes the route.
13. Merge a test unpublish PR; verify route removal and Git retention.
14. Verify 404, redirects, sitemap, headers, mobile, keyboard and screen reader.
15. Test rollback to a known-good Pages deployment including the Pages Functions API version.

## 8. Final production acceptance report template

The final report must include:
- Release date/time and production URL.
- Main commit SHA and merged PR numbers.
- Pages deployment ID/URL and the deployed Pages Functions API revision.
- Custom domain DNS, certificate and redirect evidence.
- CI run URLs and check conclusions.
- Bilingual route/translation coverage counts.
- CMS roles and Access policy test results (no secrets).
- Draft/publish/unpublish/media workflow evidence.
- Accessibility, security, browser and link test results.
- Rollback test result and recovery target.
- Known limitations, deferred work and explicit owner sign-off.

A release is not accepted if any mandatory criterion is unknown or inferred rather than tested.
