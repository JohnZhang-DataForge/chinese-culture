# Cloudflare Pages Deployment — Current State and Release Steps

**Updated:** 2026-11-09  
**Target:** Cloudflare Pages Free, Direct Upload  
**Repository:** `JohnZhang-DataForge/chinese-culture`  
**Project:** `chinese-culture`  
**Production domain:** [https://chinese-culture.site](https://chinese-culture.site)  
**Cloudflare account ID:** `dff021f8489d2c316a14575c76de16d4`

## Verified production state

- Pages project `chinese-culture` exists and production branch is `main`.
- Production deployment is active on the custom domain.
- The Pages deployment configuration includes the `CMS_DB` D1 binding for database `chinese-culture-cms`.
- Pages Functions are enabled and deployed with the site.
- Cloudflare Access application `Chinese Culture Admin` protects `/admin`, `/admin/*`, `/api/admin` and `/api/admin/*`.
- The Access allow policy is restricted to the designated administrator email. Pages production variables include `ADMIN_EMAIL`; `ADMIN_CSRF_SECRET` is stored as a Pages secret.
- D1 is provisioned but remains empty until the CMS bootstrap workflow applies the migration and imports existing articles after the integration PR is merged.
- The GitHub App has not yet been installed/configured. Publish and media actions remain disabled until the App ID, installation ID and private key are stored as Pages production secrets.

## Deployment and bootstrap workflows

- `.github/workflows/site-ci.yml` runs Node tests, local-only D1 migration validation, importer syntax checks, Astro build, local Pages Functions/D1 integration tests and static verification.
- `.github/workflows/pages-deploy.yml` deploys the static artifact and Pages Functions to the existing Pages project.
- `.github/workflows/cms-d1-bootstrap.yml` applies remote D1 migrations and runs the idempotent article import only when migration/import code reaches `main`, or when manually dispatched.
- The production migration workflow is separate from CI. Automated tests must never use `--remote`.

## Security configuration

- Cloudflare Access protects the Admin UI and API paths with an exact email allowlist.
- Pages Functions verify Access JWT issuer, audience, signature, expiry and administrator email.
- Mutating requests require the exact configured Origin and an identity-bound CSRF token.
- `ADMIN_CSRF_SECRET` is a Pages secret and is not committed to Git.
- Local auth bypass is restricted to localhost plus an exact local `ADMIN_ORIGIN`; it is not enabled in production.
- GitHub App publication permissions are documented in [GitHub App setup](../runbooks/github-app-publication.md). The App must be installed on this repository only and must not have merge, branch-protection or main-branch bypass permissions.

## Release verification

Do not claim full CMS production acceptance until all are confirmed:

- CMS integration PR merged and main CI passed.
- Production D1 migration applied and 39 article variants imported (13 each for en, zh-CN and es).
- D1 CRUD/save/reload/translation/preview smoke test passes after Access login.
- GitHub App secrets configured and session advertises `publish: true`, `mediaUpload: true`.
- Test media PR merges and media metadata attaches to D1 only after merge.
- Test publish PR merges, Pages deploy completes and public static page is live.
- Test unpublish PR merges, public route is removed and D1 history remains.
- D1 backup/export/restore and Pages rollback are documented and tested.

## Rollback

- Public site: redeploy the previous known-good Pages deployment.
- Content publication: revert the content PR through a new reviewed PR; do not edit D1 directly to hide a public-site regression.
- D1 schema: use the documented backup/restore procedure before destructive schema operations. Do not manually drop or rewrite production tables.
