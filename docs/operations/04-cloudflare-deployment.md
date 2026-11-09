# Cloudflare Pages Deployment — Current State and Release Steps

**Updated:** 2026-11-09
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
