# Agent Ownership and Dependency Matrix

**Program owner:** Agent 0 — Chief Architect and Integration Lead  
**Repository:** JohnZhang-DataForge/chinese-culture  
**Baseline:** main @ 519cb573bf65cef5172d800684e3883828ba4481

## 1. Ownership rules

- Each path has one implementation owner. Reviewers may comment but must not make competing edits in another agent's owned area.
- Agents must branch from the latest main after their dependency gate is Ready.
- Before every PR, rebase/update against the latest main and inspect changed filenames for ownership violations.
- Shared interfaces are owned by Agent 0 under docs/openspec/. No feature agent may redefine them.
- An agent needing a file outside its ownership must open a dependency request; do not edit it as a shortcut.
- No agent pushes directly to main or merges its own PR.
- The integration lead reviews all PRs for schema/API compatibility, security, test evidence and cross-agent regressions.

## 2. Agent responsibilities and exclusive ownership

| Agent | Responsibility | Owned paths / resources | Must not change |
|---|---|---|---|
| Agent 0 | Chief architect, shared contracts, architecture ADRs and integration | docs/openspec/**; docs/decisions/ADR-0002-d1-backed-cms.md; integration PRs; cross-agent review and release record | Feature implementation owned by agents 1–7 |
| Agent 1 | Cloudflare domain and DNS | Cloudflare zone/registrar/Pages custom-domain and DNS settings; docs/operations/05-production-domain-cutover.md; provide evidence and rollback notes | GitHub application code, API, Access policy, Pages workflow |
| Agent 2 | Localization and public frontend | src/pages/** except src/pages/admin/**; src/layouts/** except AdminLayout; src/components/** except admin/**; src/styles/** except admin.css; src/lib/locale/**; src/content.config.ts; src/lib/sections.ts; astro.config.mjs; public/_redirects | functions/**; database/**; Admin UI; generated content records |
| Agent 3 | Content migration, translation and D1 seed data | src/content/** for migration inputs only; database/seeds/**; docs/content/06-content-inventory.md; docs/content/07-simplified-chinese-localization-style-guide.md | src/content.config.ts; routes/layouts; database/migrations/**; API contract; backend functions |
| Agent 4 | Admin frontend | src/pages/admin/**; src/layouts/AdminLayout.astro; src/components/admin/**; src/styles/admin.css; src/lib/admin-*.mjs; src/scripts/admin.mjs; tests/admin-ui.test.mjs | Pages Functions implementation; D1 migrations; OpenAPI contract; public site shell; content seed data; package.json and workflows |
| Agent 5 | Admin backend, D1 and security | functions/**; database/migrations/**; wrangler.jsonc; scripts/cms/**; tests/admin-security.test.mjs; Cloudflare Access/GitHub App configuration and secrets (not values in Git) | Astro public frontend; content seed records; shared OpenAPI/content contracts; CI workflows; root package.json; Pages deployment workflow |
| Agent 6 | QA and CI | .github/workflows/**; package.json; playwright.config.ts; tests/e2e/**; tests/unit/**; tests/contracts/**; scripts/ci/**; docs/qa/**; branch protection configuration | Production content, public UI, Admin UI, Pages Functions business logic, D1 migrations |
| Agent 7 | Documentation | README.md; docs/** excluding docs/openspec/**, docs/qa/**, docs/operations/05-production-domain-cutover.md, docs/decisions/ADR-0002-d1-backed-cms.md and the two Agent 3 content inventory/style-guide documents | Shared OpenSpec contracts; application code; content seed data |

### Boundary clarifications

1. Agent 2 owns src/content.config.ts and public rendering. It consumes generated snapshots on main; it does not query D1 at page-read time.
2. Agent 3 supplies validated editorial seed records and translations. Agent 5 owns the idempotent D1 importer and all schema migrations.
3. Agent 5 owns D1 persistence, Pages Functions, wrangler.jsonc and the GitHub snapshot-export integration. It must not change root package.json or workflows; Agent 6 owns those integration points.
4. Agent 4 consumes admin-api.openapi.yaml. Agent 5 implements it. Neither may change the API contract unilaterally.
5. Agent 4 owns tests/admin-ui.test.mjs; Agent 5 owns tests/admin-security.test.mjs. Agent 6 owns E2E, contract/CI tests, docs/qa/** and all workflow/package integration points.
6. Agent 5 may write generated content snapshots to a CMS branch at runtime through the GitHub App. This does not grant permission to edit src/content/** as an application-code PR or to write directly to main.
7. Agent 1's DNS/custom-domain work is Cloudflare account configuration, not code; its cutover evidence document is an explicit ownership exception. Agent 5 owns Access and Pages Functions route configuration.
8. Agent 7 updates existing status/deployment documentation only after checking current Actions and Cloudflare evidence. It must not claim D1/Functions are live until the binding and deployed API are verified.

## 3. Dependency readiness

| Agent | May start when | Required contract/evidence | Parallelism |
|---|---|---|---|
| Agent 1 | Immediately for read-only domain/zone discovery; DNS mutation after owner confirms zone/domain and rollback plan | Production domain target and current Pages project name | Independent |
| Agent 2 | Agent 0 marks CC-CONTENT-001 v1.1.0 and locale route contract Ready | content-schema.md + proposal/design | Parallel with Agent 3 after schema freeze |
| Agent 3 | Agent 0 marks Content Contract v1.1.0 Ready and Agent 2 confirms destination path implementation | content-schema.md + route path contract | Parallel with Agent 2; seed data follows schema |
| Agent 4 | Agent 0 marks Admin API OpenAPI v1.2.0 Ready and Agent 5 confirms the API/auth contract | admin-api.openapi.yaml + design.md | Parallel with Agent 5 |
| Agent 5 | Agent 0 marks Admin API OpenAPI v1.2.0 Ready | admin-api.openapi.yaml + D1 design + Cloudflare D1 resource | Parallel with Agent 4 |
| Agent 6 | Agent 0 publishes acceptance criteria and API/content contracts | proposal.md + both contracts | Start baseline CI/tests early; complete after feature PRs |
| Agent 7 | Agent 0 publishes architecture, ownership and implementation sequence | all docs under docs/openspec | Parallel with implementation; docs must reflect actual evidence |

## 4. Agent completion handoff

Every agent PR description must include:
- Agent number and owned scope.
- Base SHA and source branch.
- Contract versions consumed.
- Changed paths and confirmation of ownership compliance.
- Tests run and exact results.
- Screenshots or environment evidence for UI/domain/runtime work.
- Known gaps and follow-up dependencies.
- Whether the PR is safe to merge independently.

The PR must not claim a production feature is complete based only on source code or a successful build.

## 5. Contract readiness announcement

Agent 0 will publish a GitHub issue/comment and update this document when:
- Content Contract CC-CONTENT-001 v1.1.0 is frozen for Agents 2 and 3.
- Admin API OpenAPI v1.2.0 is frozen for Agents 4 and 5.
- D1 binding, migrations and local test rules are published.
- Ownership and merge gates are active.

Until that announcement, agents may inspect and prepare but must not implement against guessed interfaces.
