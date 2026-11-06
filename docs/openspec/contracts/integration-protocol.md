# Integration, PR Review and Production Acceptance Protocol

**Owner:** Agent 0  
**Applies to:** Agents 1–7  
**Default branch:** main

## 1. Branch and repository rules

- Integration branch: agent/00-integration. Architecture amendments may use a separate Agent 0 branch.
- Every feature agent uses agent/<number>-<short-scope> or a clearly named feature branch.
- Start from the latest main SHA, not from an old feature branch or an agent's local stale branch.
- Do not push directly to main.
- Do not force-push shared branches.
- Do not commit secrets, Access JWTs, GitHub App private keys, installation tokens or Cloudflare API tokens.
- A PR must target main and include the agent ownership declaration.
- Update against latest main before final review. If a branch diverged, inspect and resolve conflicts without overwriting another agent's work.

## 2. Contract freeze and change control

Shared contracts:
- CC-CONTENT-001 v1.1.0: contracts/content-schema.md.
- Admin API OpenAPI 3.1.0 v1.2.0: contracts/admin-api.openapi.yaml.
- Locale URL and D1 persistence contracts: bilingual-admin-cms/proposal.md and design.md.

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
- Include migration/rollback notes for routes, D1 schema, Access, secrets or deployment changes.
- Contain no unrelated formatting or broad refactoring.
- Confirm no direct write to main and no merge bypass.

## 4. Agent 0 review checklist

### Architecture
- Does it preserve Astro static output for public routes?
- Are Admin API routes isolated to Pages Functions while public pages remain static?
- Are public pages independent of Admin API and D1 availability?
- Is D1 the canonical editorial store and is src/content/ clearly generated output?
- Are locale prefixes, legacy redirects and translation lookup consistent?

### Content and database
- Does each variant satisfy CC-CONTENT-001?
- Are contentId/locale pairs unique?
- Do translation variants share the same contentId?
- Are D1 migrations ordered, repeatable and tested against a clean local database?
- Is the seed/import process idempotent?
- Are all D1 reads bounded and all user values parameterized?
- Do revisions and If-Match prevent stale writes?
- Are drafts/unpublished absent from pages, search, sitemap and featured modules?
- Are all published media assets rights-cleared and accessible?

### API and security
- Does implementation match OpenAPI v1.2.0 without undocumented fields/paths?
- Is Access JWT cryptographically verified in the Pages Functions middleware?
- Are issuer, audience, signature, expiry and role checked?
- Are mutations protected by CSRF and exact Origin validation?
- Are D1 and GitHub credentials server-only?
- Are errors RFC 9457 and do they avoid leaking secrets?
- Is the API unable to write main or merge PRs?

### Quality and operations
- Do all required checks pass?
- Are mobile/keyboard/screen-reader/browser checks evidenced?
- Are domain/DNS/HTTPS and canonical redirects verified?
- Are Pages static assets, Functions and CMS_DB deployed together through the intended Wrangler workflow?
- Is D1 export/restore documented and exercised?
- Is rollback documented and exercised?
- Are docs and current status accurate?

## 5. Recommended merge order

1. **Agent 0 — contracts:** merge the D1 architecture amendment and OpenAPI v1.2.0 after documentation/structure checks.
2. **Agent 6 — CI foundations:** add D1 local migration/seed tests, OpenAPI lint and contract validation. Do not make checks permanently required until they exist and have passed at least once.
3. **Agent 5 — database/backend foundation:** D1 binding and migrations, Pages Functions routes, Access JWT validation, GitHub App auth, D1 repository/revision logic and API tests.
4. **Agent 2 — public locale framework:** locale config, routing, layout, language switch, redirects and static snapshot status filtering. Public routes do not query D1.
5. **Agent 3 — content migration:** prepare and review seed records; import only after Agent 5's idempotent importer and Agent 2's schema/routing support are ready.
6. **Agent 4 — Admin UI:** rebase the existing draft UI against current main and integrate the D1-backed API. Agent 4 and Agent 5 may develop in parallel after contract freeze.
7. **Agent 6 — final QA:** enable required checks, branch protection and end-to-end gates after feature branches have stabilized.
8. **Agent 7 — docs:** reconcile repository docs with merged implementation and real Cloudflare evidence.
9. **Agent 0 — final integration:** review cross-agent compatibility, merge only after all required checks and repository policies pass, then coordinate production verification.

If a dependency is blocked, do not merge a broken stub merely to preserve the order. Keep independent PRs open and report the blocking condition.

## 6. Merge policy

- A passing CI run is necessary but not sufficient.
- Agent 0 approves architecture compatibility; repository branch protection and authorized human review remain authoritative.
- No PR is merged while required checks are pending or failing.
- No PR is merged if the head SHA changed after review; re-check the current diff and checks.
- Prefer squash merge for isolated agent PRs unless repository policy or history requirements dictate otherwise.
- Main branch must require PRs and required status checks before feature integration begins.
- The Admin API must never merge PRs. Publishing is a reviewed GitHub merge, not an API side effect.
- D1 production migrations must be applied only by an authorized release operation after the migration has passed local/test validation.

## 7. Release sequence

1. Confirm latest main SHA and merged PR list.
2. Confirm all CI checks pass on the exact main SHA.
3. Confirm Pages production deployment succeeds.
4. Confirm Pages Functions and CMS_DB binding are included in the deployment.
5. Verify Access policies and unauthenticated denial.
6. Verify custom domain HTTPS, apex/www policy and canonical URL.
7. Verify English and Chinese home/collection/detail pages.
8. Verify language switching and hreflang.
9. Verify an editor can create, edit, save and reload a draft from D1.
10. Verify stale D1 revisions return 409.
11. Verify a draft remains private and absent from public routes.
12. Verify preview rendering and media upload with rights metadata.
13. Verify submit-for-review creates a PR containing the selected D1 revision and does not merge.
14. Merge a test publish PR through the normal review/check process; verify Pages publishes the expected route.
15. Merge a test unpublish PR; verify route removal while D1 and revision history remain.
16. Verify 404, redirects, sitemap, headers, mobile, keyboard and screen reader.
17. Test D1 export/restore against a non-production database.
18. Test rollback to a known-good Pages deployment including the Pages Functions API version.

## 8. Final production acceptance report template

The final report must include:
- Release date/time and production URL.
- Main commit SHA and merged PR numbers.
- Pages deployment ID/URL and the deployed Pages Functions API revision.
- D1 database name, binding, migration version and backup/restore evidence (no secrets).
- Custom domain DNS, certificate and redirect evidence.
- CI run URLs and check conclusions.
- Bilingual route/translation coverage counts.
- CMS roles and Access policy test results (no secrets).
- D1 content edit/save/reload and revision-conflict evidence.
- Draft/publish/unpublish/media workflow evidence.
- Accessibility, security, browser and link test results.
- Rollback test result and recovery target.
- Known limitations, deferred work and explicit owner sign-off.

A release is not accepted if any mandatory criterion is unknown or inferred rather than tested.
