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
npm run verify:openapi
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

For an external preview deployment:

```bash
QA_BASE_URL=https://<isolated-preview-host> npm run test:e2e
```

Set `QA_REQUIRE_BILINGUAL=true` to make missing `/en/` or both Chinese route candidates (`/zh/`, `/zh-cn/`) fail the suite rather than skip. The canonical Chinese segment remains an open contract decision. Set `QA_REQUIRE_ADMIN=true` only when `QA_BASE_URL` points to a preview with the backend API and Access policy deployed. Never print or commit the Access cookie; store it only as the GitHub Actions secret `QA_ACCESS_COOKIE` and refresh it when it expires.

## Destructive CMS tests

CMS mutation E2E is disabled by default. It requires all of:

- `QA_ENABLE_CMS_MUTATIONS=true`
- `QA_ENVIRONMENT=preview`
- `QA_ACCESS_COOKIE` containing the full short-lived `CF_Authorization=...` cookie header obtained after the owner signs in to the isolated preview
- `QA_TEST_CONTENT_PREFIX` matching `qa-<unique-name>`
- `QA_BASE_URL` pointing at an isolated preview hostname

The helper blocks the production apex, www hostname, and canonical Pages project hostname even when flags are set. Never set these variables for a production deployment. Use a preview branch or dedicated test environment and ensure the QA prefix is excluded from normal editorial content.

## Reports

GitHub Actions uploads Playwright HTML/JUnit output, traces, screenshots and videos (where produced) as a seven-day artifact named `chinese-culture-qa-<run number>`. The OpenAPI lint job is independent of browser/unit tests. A separate read-only production-smoke job runs after successful QA on main pushes or manual dispatches.

## Current integration boundary

The baseline main branch still contains the original English-only static site. The bilingual and CMS suites are conditional until the corresponding agent branches are integrated. The initial CMS test selector contract should be coordinated with Agent 4 before enabling write tests.

## Security limits

The suite never prints or logs the owner Cloudflare Access session cookie. Conditional mock-fetch tests for GitHub API network errors, upstream failures, rate limits and repository path safety are included; they activate when Agent 5's GitHub API helper is merged to main.

## Acceptance reports

- [Coverage matrix](coverage-matrix.md)
- [Security test report](security-report.md)
- [E2E and CI execution results](e2e-results.md)
- [Final acceptance checklist](final-acceptance.md)
