# QA Coverage Matrix

Status is based on tests that are actually executed. A skipped test is NOT TESTED.

| Requirement | Automated coverage | Execution condition | Current status |
|---|---|---|---|
| English public routes | `tests/e2e/public.spec.ts` | Default CI | Implemented; CI execution pending |
| Chinese public routes | `tests/e2e/localization.spec.ts` | `/zh/` exists | Conditional |
| About, learning, articles, festivals, books, events, legal and contact routes | Public route smoke suite | Default CI for legacy routes; bilingual paths after Agent 2 | Implemented; CI execution pending |
| 404 behavior | Public route smoke suite | Default CI | Implemented; CI execution pending |
| EN / 中文 switcher | Localization suite | `/en/` and `/zh/` return 200 | Conditional |
| Equivalent-page switching | Localization suite | Bilingual routes integrated | Conditional |
| Missing translation fallback | Localization suite | Set `QA_MISSING_TRANSLATION_PATH` | NOT TESTED until an untranslated fixture is agreed |
| HTML lang, canonical and hreflang | Localization suite | Bilingual routes integrated | Conditional |
| Sitemap | Localization suite | Bilingual routes integrated | Conditional |
| Old URL redirects | Localization suite | Bilingual routes integrated | Conditional |
| Admin dashboard and navigation | CMS UI suite not yet contract-aligned | Owner-authorized preview | NOT TESTED |
| CMS create/edit/draft/preview/publish/unpublish/delete | CMS UI suite not yet contract-aligned | Explicit preview mutation gate | NOT TESTED |
| Bilingual CMS editing and SEO fields | CMS UI suite not yet contract-aligned | Explicit preview mutation gate | NOT TESTED |
| Media upload | Admin security suite | Agent 5 media API path + owner-authorized preview | NOT TESTED |
| Anonymous and invalid JWT access | Admin security suite | `QA_REQUIRE_ADMIN=true` | NOT TESTED |
| Unauthorized writes | Admin security suite | `QA_REQUIRE_ADMIN=true` | NOT TESTED |
| Invalid content and path traversal | Admin security suite | Owner-authorized preview | NOT TESTED |
| Invalid upload content | Admin security suite | Media API contract + owner-authorized preview | NOT TESTED |
| GitHub API error handling | Backend unit/integration tests still required | Agent 5 supplies injectable client seam | NOT TESTED |
| Static content schema and route generation | Astro build + `npm run verify` | Default CI | Existing CI PASS on main run #17 |
| Formatting/lint | Optional configured scripts | If scripts exist | No lint/format script configured on inspected main |
| Secret leakage in built assets | Planned static secret scan | Add after backend secret contract is merged | NOT TESTED |
| Apex, www, SSL and production deployment | External deployment checks | Cloudflare custom-domain activation + live HTTPS probe | NOT TESTED |

## Existing main-branch evidence (pre-QA branch)

- Static CI run #17 on commit `539b37c` succeeded.
- Build generated 25 pages.
- Existing static verifier reported 12 required routes, 13 content pages, 29 static files and 700 internal links.
- Cloudflare Pages production deployment run #9 completed successfully; custom hostnames still require independent validation.

These historical results do not count as execution of the new Playwright suite.
