# E2E and CI Execution Results

**Assessment date:** 2026-11-05

## Agent 6 Playwright execution

| Run | Commit | Result | Details |
|---|---|---|---|
| QA run #41935393575 | Initial Agent 6 QA commit | PASS | 15 Playwright tests passed, 33 feature-gated tests skipped, 0 failed |
| QA run #41937704379 | cbe29c2 | FAIL | Build, secret scan and static route verification passed; OpenAPI lint failed before unit/E2E steps could run |
| Latest workflow definition | Agent 6 branch | Pending re-execution | OpenAPI lint was split into its own job so a contract failure no longer prevents independent unit and E2E tests from running |

The initial Playwright run covered the existing English public routes, 404 behavior, homepage title/description/language, skip-link keyboard focus and primary navigation. The 33 skips were bilingual and Admin tests whose implementation or authorized test environment was not yet available. They are NOT TESTED, not PASS.

## Other agent test evidence

| Workflow | Run | Result |
|---|---:|---|
| Agent 4 Admin frontend unit tests | #41937672512 | 12 PASS / 0 FAIL |
| Agent 5 Admin backend security tests | #41935155388 | 11 PASS / 0 FAIL |
| Main static CI baseline | Run #17 | PASS |
| Main Pages deployment | Run #9 | PASS |

The earlier Agent 4 failure in run #41935738421 (11 PASS / 1 FAIL) was corrected; the latest run #41937672512 passed all 12 tests.

## OpenAPI lint failure

Run #41937704379 executed Redocly CLI against Admin API OpenAPI v1.1.0 and failed:

- Dozens of response references are unresolved.
- The component map is located at components.parameters.responses, rather than components.responses.
- The structural linter rejects the misplaced component.

Agent 0 was notified in issue #7. The QA workflow was then changed to isolate contract lint from the browser/unit job.

## Not yet executed

- Full bilingual route matrix and /zh/ vs /zh-cn/ canonical-route decision.
- Admin UI browser tests against a real authenticated Pages preview.
- Authenticated CMS API draft lifecycle, SEO/tag round-trip and media validation.
- Publish/unpublish PR lifecycle and cleanup.
- GitHub API failure injection against the completed backend.
- Production apex/www HTTP/TLS smoke from GitHub Actions.

No CMS mutation was enabled, and no production content was changed.
