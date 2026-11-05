# QA Coverage Matrix

Status is based on tests that are actually executed. A skipped test is NOT TESTED.

| Requirement | Automated coverage | Execution condition | Current status |
|---|---|---|---|
| English public routes | `tests/e2e/public.spec.ts` | Default CI | Implemented; CI execution pending |
| Chinese public routes | `tests/e2e/localization.spec.ts` probes both `/zh/` and `/zh-cn/` and follows redirects | Either agreed Chinese route exists | Conditional; canonical segment still unresolved |
| About, learning, articles, festivals, books, events, legal and contact routes | Public route smoke suite | Default CI for legacy routes; bilingual paths after Agent 2 | Implemented; CI execution pending |
| 404 behavior | Public route smoke suite | Default CI | Implemented; CI execution pending |
| EN / 中文 switcher | Localization suite | `/en/` and `/zh/` return 200 | Conditional |
| Equivalent-page switching | Localization suite | Bilingual routes integrated | Conditional |
| Missing translation fallback | Localization suite | Set `QA_MISSING_TRANSLATION_PATH` | NOT TESTED until an untranslated fixture is agreed |
| HTML lang, canonical and hreflang | Localization suite | Bilingual routes integrated | Conditional |
| Sitemap | Localization suite | Bilingual routes integrated | Conditional |
| Old URL redirects | Localization suite | Bilingual routes integrated | Conditional |
| Admin dashboard and navigation | CMS UI suite not yet contract-aligned | Owner-authorized preview | NOT TESTED |
| CMS create/edit/draft/preview/delete-draft | `tests/e2e/admin-cms-api.spec.ts` | Explicit preview mutation gate + owner JWT | Implemented; NOT TESTED until a preview target is authorized |
| CMS publish/unpublish PR lifecycle | Requires isolated test PR lifecycle and cleanup contract | Preview branch only | NOT TESTED |
| Bilingual CMS editing, SEO fields and tags | API draft lifecycle test verifies locale variants, SEO metadata and tags round-trip | Explicit preview mutation gate + owner JWT | Implemented; NOT TESTED until preview is authorized; UI SEO payload mapping still pending Agent 4 |
| Media upload | Admin security suite | Agent 5 media API path + owner-authorized preview | NOT TESTED |
| Anonymous and invalid JWT access | Admin security suite | `QA_REQUIRE_ADMIN=true` | NOT TESTED |
| Unauthorized writes | Admin security suite | `QA_REQUIRE_ADMIN=true` | NOT TESTED |
| Invalid content and path traversal | Admin security suite | Owner-authorized preview | NOT TESTED |
| Invalid upload content | Admin security suite | Media API contract + owner-authorized preview | NOT TESTED |
| GitHub API error handling | Backend unit/integration tests still required | Agent 5 supplies injectable client seam | NOT TESTED |
| Static content schema and route generation | Astro build + `npm run verify` | Default CI | Existing CI PASS on main run #17 |
| OpenAPI syntax and structural lint | `npm run verify:openapi` (Redocly minimal ruleset) | Contract file merged on main (Admin API v1.1.0) | FAIL on run #41937704379: `components.responses` is nested under `components.parameters`, leaving response refs unresolved; Agent 0 notified |
| Formatting/lint | Optional configured scripts | If scripts exist | No lint/format script configured on inspected main |
| Secret leakage in built assets | Planned static secret scan | Add after backend secret contract is merged | NOT TESTED |
| Apex DNS and Pages binding | Cloudflare control-plane read: apex CNAME is proxied to Pages; Pages custom domain validation is active | Cloudflare configuration | PASS (control plane); live HTTP probe NOT TESTED |
| www redirect | Enabled zone redirect rule returns 301 to HTTPS apex and preserves path/query | Cloudflare ruleset read | PASS (rule configuration); live 301 response NOT TESTED |
| SSL | Pages apex/www validation active; zone SSL mode is Full and wildcard certificate status is active | Cloudflare control-plane read | PASS (configuration); external TLS handshake NOT TESTED |
| HTTP to HTTPS | Enabled apex HTTP-to-HTTPS 301 rule; global Always Use HTTPS setting is off | Cloudflare ruleset/settings read | PASS (rule configuration); live response NOT TESTED |
| Production deployment | Pages Deploy workflow run #9 triggered by push to main, completed SUCCESS on commit `539b37c` | GitHub Actions + Pages deployment record | PASS |
| Cloudflare Access protection | Account and zone Access application lists each return 0 apps; account policy list returns 0 policies | Cloudflare control-plane read | FAIL — no Access application/policy currently protects `/admin/*` or `/api/admin/*` |
| Pages Functions runtime | Latest production deployment reports `uses_functions=false`; Agent 5 API handlers are not yet in the production deployment | Cloudflare Pages project read | FAIL — backend is not deployed |

## Existing main-branch evidence (pre-QA branch)

- Static CI run #17 on commit `539b37c` succeeded.
- Build generated 25 pages.
- Existing static verifier reported 12 required routes, 13 content pages, 29 static files and 700 internal links.
- Cloudflare Pages production deployment run #9 completed successfully; custom hostnames still require independent validation.

These historical results do not count as execution of the new Playwright suite.
