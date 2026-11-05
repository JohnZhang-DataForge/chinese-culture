# Agent Ownership and Dependency Matrix

**Program owner:** Agent 0 — Chief Architect and Integration Lead  
**Repository:** JohnZhang-DataForge/chinese-culture  
**Baseline:** main @ 539b37c9bfa5363f7149c95563bd549957eeff3d

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
| Agent 0 | Chief architect, shared contracts, integration | docs/openspec/**; integration PRs; cross-agent review and release record | Feature implementation owned by agents 1–7 |
| Agent 1 | Cloudflare domain and DNS | Cloudflare zone/registrar/Pages custom-domain and DNS settings; `docs/operations/05-production-domain-cutover.md`; provide evidence and rollback notes | GitHub application code, API, Access policy, Pages workflow |
| Agent 2 | Localization and public frontend | src/pages/** except src/pages/admin/**; src/layouts/** except AdminLayout; src/components/** except admin/**; src/styles/** except admin.css; src/lib/locale/**; src/content.config.ts; src/lib/sections.ts; astro.config.mjs; public/_redirects | src/content/**; functions/**; API contract; admin UI |
| Agent 3 | Content migration and translation | src/content/**; `docs/content/06-content-inventory.md`; `docs/content/07-simplified-chinese-localization-style-guide.md` | src/content.config.ts; routes/layouts; shared contracts; workflows |
| Agent 4 | Admin frontend | src/pages/admin/**; src/layouts/AdminLayout.astro; src/components/admin/**; src/styles/admin.css; src/lib/admin-*.mjs; src/scripts/admin.mjs; tests/admin-ui.test.mjs | Pages Functions implementation; OpenAPI contract; public site shell; content files; package.json and workflows |
| Agent 5 | Admin backend and security | functions/**; tests/admin-security.test.mjs; Cloudflare Access/GitHub App configuration and secrets (not values in Git) | Astro public frontend; content schema contract; CI workflows; root package.json; Pages deployment workflow |
| Agent 6 | QA and CI | .github/workflows/**; scripts/**; package.json; playwright.config.ts; tests/e2e/**; tests/unit/**; tests/contracts/**; docs/qa/**; branch protection configuration | Production content, public UI, Admin UI, Pages Functions business logic |
| Agent 7 | Documentation | README.md; docs/** excluding docs/openspec/**, docs/qa/**, docs/operations/05-production-domain-cutover.md and the two Agent 3 content inventory/style-guide documents | Shared OpenSpec contracts; application code; content Markdown |

### Boundary clarifications

1. Agent 2 owns src/content.config.ts, which implements the schema contract. Agent 3 supplies records only; its inventory and localization style guide are explicit documentation ownership exceptions. If a record cannot satisfy the schema, Agent 3 asks Agent 0/2 for a contract or implementation change; it does not weaken the schema.
2. Agent 2 owns locale routing and public rendering. Agent 3 may change content file paths and frontmatter only after the locale schema is Ready.
3. Agent 4 consumes admin-api.openapi.yaml. Agent 5 implements it. Neither may change the API contract unilaterally.
4. Agent 5's Pages Functions live under functions/ and use the existing Pages Wrangler deployment. Agent 5 must not change root package.json or workflows; Agent 6 owns those integration points.
5. Agent 1's DNS/custom-domain work is Cloudflare account configuration, not code; its cutover evidence document is an explicit ownership exception. Agent 5 owns Access and Pages Functions route configuration.
6. Agent 4 owns tests/admin-ui.test.mjs and Agent 5 owns tests/admin-security.test.mjs. Agent 6 owns E2E, unit, contract tests, docs/qa/** and all workflow/package integration points.
7. Agent 7 updates existing status/deployment documentation only after checking current Actions and Cloudflare evidence. It must not repeat old "deployment pending token" statements after a successful deployment.

## 3. Dependency readiness

| Agent | May start when | Required contract/evidence | Parallelism |
|---|---|---|---|
| Agent 1 | Immediately for read-only domain/zone discovery; DNS mutation after owner confirms zone/domain and rollback plan | Production domain target and current Pages project name | Independent |
| Agent 2 | Agent 0 marks CC-CONTENT-001 v1.1.0 and locale route contract Ready | content-schema.md + proposal/design | Parallel with Agent 3 after schema freeze |
| Agent 3 | Agent 0 marks Content Contract v1 Ready and Agent 2 confirms destination path implementation | content-schema.md + route path contract | Parallel with Agent 2; do not change schema code |
| Agent 4 | Agent 0 confirms Admin API OpenAPI v1.1.0 passes Redocly lint and marks the API/auth/CSRF contract Ready | admin-api.openapi.yaml + design.md | Parallel with Agent 5 |
| Agent 5 | Agent 0 confirms Admin API OpenAPI v1.1.0 passes Redocly lint and marks the API/auth/GitHub App contract Ready | admin-api.openapi.yaml + design.md | Parallel with Agent 4 |
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
- Admin API OpenAPI v1.1.0 is frozen for Agents 4 and 5.
- Ownership and merge gates are active.

Until that announcement, agents may inspect and prepare but must not implement against guessed interfaces.
