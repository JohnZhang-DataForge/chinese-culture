# Cloudflare Pages Deployment — Current State and Release Steps

**Updated:** 2026-11-12
**Target:** Cloudflare Pages Free, Direct Upload
**Repository:** JohnZhang-DataForge/chinese-culture
**Project:** chinese-culture
**Production domain:** https://chinese-culture.site

## Latest verified production release — 2026-11-11

- Main: `26958755b749993bc30a8f3f578aec61efe7e09c`.
- Main CI #43115514920 passed `static-build` and `admin-browser`.
- Pages deployment and production smoke #43115515036 passed.
- Cloudflare production deployment: `2693bd16-214f-4337-8bcb-af5c0202c6db`.
- Cloudflare read-back confirms the deployment commit matches Main.
- Owner confirmed App ID `5712195`, Installation ID `180887271`, and provided a Cloudflare dashboard screenshot showing `GITHUB_APP_PRIVATE_KEY` saved as a Production Secret. Cloudflare API omits encrypted secret values from environment reads. The current Direct Upload deployment predates the secret addition; its retry endpoint rejects retries for Direct Upload deployments, so a subsequent normal Pages deployment is required before runtime verification.
- GitHub repository rulesets API returns an empty list. Owner configuration of the `main` ruleset remains pending.
- PR #68 added repository-ID scoping to all GitHub App installation tokens; its CI and isolated Pages preview passed.

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
- App ID, Installation ID and the production private-key Secret have been supplied/configured by the owner. Token issuance, authenticated Admin session capabilities and production PR workflows remain unverified until a new Pages deployment loads the secret.

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

## GitHub Actions recovery and main branch ruleset — 2026-11-11

The repository owner made `JohnZhang-DataForge/chinese-culture` public after GitHub Actions reported: "The job was not started because recent account payments have failed or your spending limit needs to be increased."

The previously blocked runs were rerun successfully:
- Main CI [#42916306326](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42916306326), attempt 4: `static-build` and `admin-browser` passed.
- Pages deployment [#42916306335](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42916306335), attempt 4: build, deployment credential check, Pages deploy and production route/Access smoke passed.
- Current production deployment: `5fe2af05-4119-4578-a125-f7f17eadd699`, commit `a938e4b2ffdc43b6d962263873d985f51ade354b`.

### Main ruleset still needs owner configuration

A read-only GitHub API request to `GET /repos/JohnZhang-DataForge/chinese-culture/rulesets` returned an empty list. The connected GitHub integration cannot create rulesets or read the branch-protection endpoint. Configure this in GitHub UI:

1. Repository **Settings → Rules → Rulesets → New branch ruleset**.
2. Target branch `main`.
3. Require a pull request before merging.
4. Require the `static-build` status check.
5. Require conversation resolution.
6. Block force pushes and branch deletion.
7. Keep the bypass list empty (or limited to an explicitly documented emergency owner process); do not add the CMS Publisher App.

Do not assume public repository visibility automatically protects `main`. Verify the saved ruleset after creation.


## Post-PR #54 production acceptance — 2026-11-11

- PR #54 merged as `0e621be26009c4dabe69843dfb42d65ad474587c`.
- PR CI #42920011297 passed both `static-build` and `admin-browser` (Chromium installation and browser/responsive accessibility tests included).
- Post-merge Main CI #42920572091 passed; Pages deployment #42920572127 passed build, deployment credential check, production deploy and production route/Cloudflare Access smoke.
- Cloudflare Pages read-back confirms latest production deployment `cddb8296-5d94-4bc9-9a87-c8ea31ade484` serves commit `0e621be26009c4dabe69843dfb42d65ad474587c`.
- Read-only production configuration inspection found `CMS_DB` still bound and the existing Access/admin settings present. `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` and `GITHUB_APP_PRIVATE_KEY` were not present in the production configuration; App publication/media acceptance remains blocked on owner-side setup. No secret values were retrieved.


## Superseding repository visibility and latest release status — 2026-11-11

The earlier note under “Main branch protection status” saying “Keep the repository private” is superseded: the owner subsequently made this repository public so previously blocked GitHub Actions could run. Do not change repository visibility as part of this CMS work. Public visibility does not itself protect `main`; the latest read-only `GET /repos/JohnZhang-DataForge/chinese-culture/rulesets` response is an empty list, so P6.9 remains incomplete.

Latest Main after PR #56: `6763fa6faceff0ef5da6b62e3520d4f51e093c7c`.
- Main CI #42922241144: `static-build` and `admin-browser` passed.
- Pages deployment #42922241177: build, deploy, production route and Cloudflare Access smoke passed.
- Current production deployment ID: `b19551bd-4c07-422b-9600-2f99c0bc1697`.
- Read-only Pages production config shows existing `CMS_DB` and Access/admin settings. `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, and `GITHUB_APP_PRIVATE_KEY` are absent; no secret values were read.

PR #56 merged the refreshed Simplified Chinese editorial guide aligned to CC-CONTENT-001 v1.2.0 and `zh-CN`. PR #2 remains open as a historical inventory/style draft; its useful editorial guidance has been carried forward in PR #56. PR #12 remains open because its early architecture/operations snapshot is materially stale and must not be merged unchanged.


## GitHub App and post-secret deployment — 2026-11-12

- Production deployment `2693bd16-214f-4337-8bcb-af5c0202c6db` matches Main `26958755b749993bc30a8f3f578aec61efe7e09c` and is aliased to `chinese-culture.site` and `www.chinese-culture.site`.
- Main CI #43115514920 and Pages deployment/production smoke #43115515036 passed.
- Cloudflare Access read-back confirms the `Chinese Culture Admin` application protects `/admin`, `/admin/*`, `/api/admin` and `/api/admin/*` with the designated administrator email Allow policy.
- The GitHub App credentials are supplied and the secret has been loaded by a successful post-secret deployment. Token issuance and authenticated Admin acceptance are not yet verified.
- GitHub repository rulesets remain empty; the owner must configure the `main` ruleset.
