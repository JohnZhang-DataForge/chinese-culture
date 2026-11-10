# Developer Runbook — Astro, Cloudflare Pages and D1 CMS

**Status:** Implemented multilingual public site and protected Admin foundation · **Updated:** 2026-11-11

## Prerequisites

- Node.js 20.19 or later (CI uses Node.js 22), npm and Git.
- GitHub access to `JohnZhang-DataForge/chinese-culture`.
- Cloudflare access only when working on Pages/D1 operations.
- Never copy Cloudflare tokens, Access secrets or GitHub App keys into source files or chat.

## Local development

```bash
git clone https://github.com/JohnZhang-DataForge/chinese-culture.git
cd chinese-culture
npm install
npm run dev
```

## Validation commands

```bash
npm run validate:content
npm test
npm run build
npm run verify
npm run test:browser
```

The optional isolated Pages preview/browser workflow uses `npm run test:preview` with its configured preview environment.

## D1 and Pages Functions development

- Apply schema migrations to local D1 only: `npx wrangler d1 migrations apply chinese-culture-cms --local`.
- Run the local Pages Functions environment with the CMS local runbook.
- Automated tests must never use `--remote` or the production D1 database.
- Production migration/import is handled only by the dedicated, reviewed bootstrap workflow.
- See [CMS D1 local development](../runbooks/cms-d1-local-development.md).

## Production architecture

- Public Astro pages are static and use generated Markdown snapshots from `main`.
- D1 (`CMS_DB`) is the canonical editable content store.
- Pages Functions serve the protected Admin API under `/api/admin/v1/`.
- Cloudflare Access protects `/admin/*` and `/api/admin/*`.
- The CMS must create review branches/PRs and must never auto-merge or write directly to `main`.

## Deployment

A push to `main` triggers CI and the Cloudflare Pages deployment workflow. The deployment workflow uses the repository Actions secret `CLOUDFLARE_API_TOKEN`. Do not reveal or rotate it without an explicit operational reason. After a merge, verify:
1. Main CI completed successfully.
2. Pages deployment completed successfully.
3. Cloudflare's latest production deployment references the expected Main SHA.
4. Public locale routes and Access-protected Admin routes pass smoke tests.

## Outstanding owner-level gates

- Install the repository-scoped GitHub App and configure the three production settings described in [GitHub App publication setup](../runbooks/github-app-publication.md).
- Complete authenticated production CRUD and reviewed publish/unpublish/media acceptance.
- Configure required main-branch checks and no-bypass ruleset in GitHub Settings.
- Complete the Pages rollback rehearsal after explicit approval.

## Safety

Do not use production D1 for local tests. Do not paste secrets into issues, PRs, documentation or chat. Do not merge content publication PRs without human review. Do not assume that a successful build proves that production Admin CRUD or GitHub publication works.
