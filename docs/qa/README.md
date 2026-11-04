# Quality Assurance

## Scope

The QA suite is separate from the production Cloudflare Pages deployment workflow. It builds and validates Astro static output, runs Node.js unit tests, and uses Playwright against the local Astro preview server by default.

Feature-specific checks are explicitly skipped until bilingual routes and the Admin CMS from Agents 2–5 are integrated. Skipped tests are **NOT TESTED**, not PASS.

## Commands

```bash
npm install
npm run build
npm run verify
npm run verify:secrets
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

For an external preview deployment:

```bash
QA_BASE_URL=https://<isolated-preview-host> npm run test:e2e
```

Set `QA_REQUIRE_BILINGUAL=true` to make missing `/en/` or `/zh/` routes fail the suite rather than skip. Set `QA_REQUIRE_ADMIN=true` after the backend API contract and Access protection are deployed to a test environment.

## Destructive CMS tests

CMS mutation E2E is disabled by default. It requires all of:

- `QA_ENABLE_CMS_MUTATIONS=true`
- `QA_ENVIRONMENT=preview`
- `QA_ACCESS_JWT` containing a valid owner Access JWT
- `QA_TEST_CONTENT_PREFIX` matching `qa-<unique-name>`
- `QA_BASE_URL` pointing at an isolated preview hostname

The helper blocks the production apex, www hostname, and canonical Pages project hostname even when flags are set. Never set these variables for a production deployment. Use a preview branch or dedicated test environment and ensure the QA prefix is excluded from normal editorial content.

## Reports

GitHub Actions uploads Playwright HTML/JUnit output, traces, screenshots and videos (where produced) as a seven-day artifact named `chinese-culture-qa-<run number>`.

## Current integration boundary

The baseline main branch still contains the original English-only static site. The bilingual and CMS suites are conditional until the corresponding agent branches are integrated. The initial CMS test selector contract should be coordinated with Agent 4 before enabling write tests.

## Security limits

The suite never stores or prints an owner JWT. GitHub API failure injection is not enabled in this branch because the backend contract does not yet expose a safe test-only injection mechanism. That case remains NOT TESTED until Agent 5 supplies a deterministic mock seam or unit-testable GitHub client boundary.
