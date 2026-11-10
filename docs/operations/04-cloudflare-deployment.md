# Cloudflare Pages Deployment — Current State and Release Steps

**Updated:** 2026-11-10
**Target:** Cloudflare Pages Free, Direct Upload
**Repository:** JohnZhang-DataForge/chinese-culture
**Project:** chinese-culture
**Production domain:** https://chinese-culture.site

## Verified production state

- Pages project chinese-culture is deployed from main.
- Production deployment includes the Pages Functions bundle and static output.
- The production Pages project binds CMS_DB to D1 database chinese-culture-cms.
- Cloudflare Access application Chinese Culture Admin protects /admin, /admin/*, /api/admin and /api/admin/*.
- The Access allow policy is restricted to the designated administrator email.
- Pages production variables include ADMIN_EMAIL, ADMIN_ORIGIN, CF_ACCESS_AUD and CF_ACCESS_TEAM_DOMAIN; ADMIN_CSRF_SECRET is configured as a secret.
- Production D1 migrations and article import completed successfully after PR #34 merged.

## Production D1 import acceptance

Direct read-only queries against production D1 confirmed:

| Table / validation | Result |
|---|---:|
| content_items | 13 |
| content_variants | 39 |
| content_revisions | 39 |
| cms_submissions | 0 |
| English variants | 13 |
| Simplified Chinese variants | 13 |
| Spanish variants | 13 |
| Content IDs missing a locale | 0 |
| Collection mismatches | 0 |
| Missing required title/description/body | 0 |
| Missing current revision snapshots | 0 |
| Published variants | 39 |

Collection counts per language are books 2, culture 3, festivals 3 and lessons 5. A representative article read-back confirmed all three translations, body content, Unsplash cover URL and localized alt text were preserved.

Latest production release for merged Main `46c50f3cc0e731179ebaa6fedf8dc57f7c3e83d9` (PR #36):
- [Main CI #42539468779](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42539468779) — success.
- [Pages deployment + production smoke #42539468756](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42539468756) — success.
- Production deployment ID: `67df1ace-3a10-46f4-bee1-d1457ad760ec`.
- Deployment preview: https://67df1ace.chinese-culture-79h.pages.dev
- Smoke results: six public locale/home/article pages HTTP 200; `/admin/` and `/api/admin/v1/session` challenged by Cloudflare Access; `www` permanently redirected to apex with HTTP 301.

## Workflows and data safety

- .github/workflows/site-ci.yml runs Node tests, local-only D1 migration validation, importer syntax checks, Astro build, local Pages Functions/D1 integration tests and static verification.
- .github/workflows/pages-deploy.yml deploys static output and Pages Functions.
- .github/workflows/cms-d1-bootstrap.yml is the only automated production migration/import path.
- Automated tests must never use --remote or mutate production D1.
- Importer uses deterministic IDs and idempotent inserts; re-running bootstrap does not duplicate the imported records.

## Security configuration

- Cloudflare Access protects Admin UI and API paths with an exact email allowlist.
- Pages Functions verify Access JWT issuer, audience, signature, expiry and administrator identity.
- Mutating requests require exact Origin and identity-bound CSRF.
- The browser never receives a GitHub token.
- GitHub App publication permissions are documented in docs/runbooks/github-app-publication.md. The App must be installed on this repository only and must not have merge or branch-protection bypass permissions.
- Production Pages currently has no GITHUB_APP_ID, GITHUB_INSTALLATION_ID or GITHUB_APP_PRIVATE_KEY; publish and media actions remain disabled until the owner completes App installation and secret configuration.

## Remaining acceptance gates

- Sign in to Admin through Cloudflare Access and verify live D1 create/edit/save/reload/translation/preview behavior. The unauthenticated Access challenge is now verified by production smoke; authenticated CRUD still requires the designated administrator's browser session and remains pending.
- Configure the repository-scoped GitHub App and confirm the Admin session reports publish=true and mediaUpload=true.
- Submit and merge a media PR; verify D1 attaches media only after merge.
- Submit and merge a publish PR; verify Pages deployment and D1 status synchronization.
- Submit and merge an unpublish PR; verify public route removal while D1 revision history remains.
- Perform and document a durable D1 export/restore test and Pages rollback.

## Backup and recovery

See [D1 Backup and Recovery](05-d1-backup-and-restore.md) for Time Travel, SQL export/import, verification queries and the current rehearsal evidence.

## Rollback

- Public site: redeploy the previous known-good Pages deployment.
- Content publication: revert the content PR through a new reviewed PR; do not edit D1 directly to hide a public-site regression.
- D1 schema/data: use a verified export/restore procedure before destructive operations. Never drop or rewrite production tables manually.

## Isolated PR preview environment

Pull-request previews use `wrangler.preview.jsonc`, not the production `wrangler.jsonc`.

- `.github/workflows/pages-preview.yml` deploys same-repository PRs to the Pages branch alias `https://pr-<number>.chinese-culture-79h.pages.dev`.
- The preview Wrangler config intentionally contains only the Pages project name, compatibility date and static output directory. It has **no D1 binding, no production variables and no Access credentials**.
- The production D1 database ID `8b6f6c98-06fe-49eb-adbc-690d4b57c058` must never be attached to a preview deployment.
- With preview Access settings absent, the Admin API must fail closed with HTTP 401 (`unauthorized`) when no Access JWT is present; if a token is present but Access configuration is incomplete, the API returns HTTP 503; it must not serve demo content or connect to production data.
- The preview browser smoke verifies English, Simplified Chinese and Spanish public routes, Admin noindex metadata, production build mode, and the fail-closed session API.
- This is a static/public preview plus a fail-closed Admin API check. It does not replace authenticated production CRUD acceptance.
- Fork-origin PRs do not receive a Pages preview deployment because the workflow skips them.

The preview binding isolation is guarded by `tests/preview-config.test.mjs`. Do not add a D1 binding or copy production secrets into `wrangler.preview.jsonc`.

### Preview acceptance evidence (2026-11-10)

- [PR preview workflow #42724399464](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724399464) succeeded after deploying the PR branch with the minimal preview Wrangler config.
- Preview alias: https://pr-51.chinese-culture-79h.pages.dev
- Chromium smoke passed for `/en/`, `/zh-cn/` and `/es/`, and verified `/admin/` is production-built (`data-demo=false`, `noindex`) with no demo article content.
- Unauthenticated `GET /api/admin/v1/session` returned HTTP 401 (`unauthorized`); the API is fail-closed without a Cloudflare Access JWT.
- Cloudflare Pages project configuration shows preview env vars empty and no preview D1 binding; production `CMS_DB` remains bound only to production.
- Preview configuration uses `wrangler.preview.jsonc`, which deliberately omits D1 and production variables. The workflow copies it to the default `wrangler.jsonc` only in the ephemeral GitHub Actions workspace because Wrangler Pages does not support custom config paths.
- This preview acceptance does not replace authenticated production CRUD acceptance.


## Latest production release — 2026-11-10

Main: `16155cc3bbfa20a45c9f6b806e8d2b1e8a133af1`.

- [Main CI #42724937729](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724937729) — static-build and Admin Chromium passed.
- [Production Pages deployment #42724937781](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724937781) — succeeded.
- Production deployment ID: `c4df8db2-ec98-4d72-8c9b-de589b4bee14`.
- PR #51 merged the isolated preview workflow and browser smoke; [preview run #42724699134](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724699134) passed.
- Cloudflare API read-back confirms production `CMS_DB` remains bound to the production database; the preview environment has no D1 binding and no environment variables.

## Main branch protection status

The workflow runs required quality jobs on pull requests, but do not assume those checks are enforced by GitHub branch protection. The repository-rulesets API returned: “Upgrade to GitHub Pro or make this repository public to enable this feature.” The current GitHub integration also cannot read the branch-protection endpoint. Keep the repository private; do not change visibility just to enable rulesets. Revisit P6.9 after an eligible GitHub plan and owner-level settings access are available. Until then, maintain the human PR review/merge process and verify CI before merging.

## Cost and usage monitoring

See [Cloudflare Cost and Limit Monitoring](06-cost-and-limit-monitoring.md) for the current published Workers Free/D1 limits, Pages Functions request accounting, monitoring locations and thresholds. The guide records plan limits, not live account consumption.


## Native D1 SQL backup/restore acceptance — 2026-11-11

The dedicated workflow [#42726758673](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42726758673) successfully downloaded the D1-compatible production SQL dump, imported it into a disposable US-jurisdiction D1 database, compared table and locale counts with the production snapshot, verified zero foreign-key violations, and deleted the temporary database. The dump was 212,583 bytes (SHA-256 recorded in [the D1 backup runbook](05-d1-backup-and-restore.md)). No backup artifact was retained. Native SQL round-trip testing is complete; Pages rollback remains pending.


## Pages rollback preflight — 2026-11-11

Read-only Cloudflare API preflight observed current production deployment `ac9f2411-f9c6-49f8-ac98-d7e81e494f1b` (commit `0d45537ab85f6d14872a9898301765fa20ac2700`) and previous successful production deployment `c4df8db2-ec98-4d72-8c9b-de589b4bee14` (commit `16155cc3bbfa20a45c9f6b806e8d2b1e8a133af1`). No rollback was issued. Pages rollback does not roll back D1; check schema/data compatibility first. P8.10b remains pending explicit owner approval. See [D1 backup and restore runbook](05-d1-backup-and-restore.md).
