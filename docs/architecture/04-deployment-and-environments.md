# Deployment and Environments — Cloudflare Pages + D1 CMS

**Status:** Partially implemented and deployed. Public routes remain static; authenticated editorial APIs run as Cloudflare Pages Functions.

## Production components

| Component | Verified configuration | Role |
|---|---|---|
| Public site | Cloudflare Pages project `chinese-culture` | Serves prerendered Astro HTML/CSS/JS/media |
| Build output | `dist/` | Static site artifact |
| Pages Functions | `functions/api/admin/v1/` | Authenticated CMS APIs only |
| D1 binding | `CMS_DB` | Private editorial database binding |
| D1 database | `chinese-culture-cms` | Canonical article/translation/revision/submission storage |
| Access app | `chinese-culture.site/admin` | Protects both `/admin/*` and `/api/admin/*` destinations |
| Access policy | Exact administrator email allowlist | Deny-by-default access |
| Admin origin | `https://chinese-culture.site` | Same-origin mutation check |

## Deployment workflow

1. GitHub Actions runs unit tests, a local-only D1 migration check, Astro build and static output verification.
2. The Pages deployment workflow deploys `dist/` and the Pages Functions bundle to the existing Pages project.
3. The CMS bootstrap workflow runs only when migration/import code reaches `main`. It applies unapplied D1 migrations remotely, then imports the existing published article variants idempotently.
4. Editorial publication creates a GitHub branch and pull request. It never writes directly to `main` or auto-merges.
5. Merging the reviewed content PR triggers the normal Pages deployment. Public pages are generated from the Markdown snapshot on `main`.

## Local development and environment isolation

See [CMS D1 local development runbook](../runbooks/cms-d1-local-development.md).

- Local migration command: `npx wrangler d1 migrations apply chinese-culture-cms --local`.
- Local Pages Functions runtime: `npx wrangler pages dev dist`.
- Automated tests use only local D1 state.
- The production migration/import workflow is separate and explicit. Tests must never use `--remote`.

## Security configuration

- Cloudflare Access protects both the Admin page and Admin API paths.
- Pages Functions verify the Access JWT issuer, audience, signature, expiry and administrator email.
- Mutating requests require the exact configured Origin and an identity-bound CSRF token.
- `ADMIN_CSRF_SECRET` is a Pages secret and is not committed to Git.
- The local-only auth bypass is restricted to localhost plus an exact local `ADMIN_ORIGIN`; it is not enabled in production.
- The GitHub App is not yet configured. Publication remains disabled until an app restricted to this repository is installed and its ID, installation ID and private key are stored as Pages secrets.
- Media upload remains disabled pending the approved storage/branch implementation.

## Release gates still outstanding

- Apply production migration and verify the 39 existing article variants are imported with all three locales.
- Verify D1 CRUD/save/reload/translation/preview against production after Access login.
- Create a repository-scoped GitHub App with Contents read/write, Pull Requests read/write and Checks read-only; no main-branch direct write or merge permission.
- Configure GitHub App Pages secrets and test publish/review/unpublish PR flows.
- Implement and test media upload with mandatory rights/accessibility metadata.
- Complete D1 backup/restore and publication rollback evidence.

## Rollback

- Public site: redeploy the previous known-good Pages artifact/commit.
- Content publication: revert the content PR through a new reviewed PR; do not edit D1 directly to hide a public-site regression.
- D1 schema: use the automatic pre-migration backup and a documented restore procedure; do not manually drop or rewrite production tables.
