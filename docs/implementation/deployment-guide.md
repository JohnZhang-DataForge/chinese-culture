# Deployment Guide

**Current release path:** GitHub Actions + Wrangler Direct Upload to Cloudflare Pages Free.

## Automatic production deployment

A push to \`main\` triggers:

1. \`site-ci.yml\`: install, build, static verification and a short-lived build artifact.
2. \`pages-deploy.yml\`: install, build, static verification, credential preflight and Wrangler Direct Upload.

Pull requests run CI but do not deploy to production. The Pages deployment workflow can also be started manually with \`workflow_dispatch\` on \`main\`.

## Required credential

The repository Actions secret \`CLOUDFLARE_API_TOKEN\` must contain a least-privilege Cloudflare token with the Pages Write permission for the account hosting this project. Never put its value in source control or documentation.

The deployment workflow has the Cloudflare account ID configured directly in YAML. It is an account identifier, not a secret.

## Verify a deployment

1. Open [GitHub Actions](https://github.com/JohnZhang-DataForge/chinese-culture/actions).
2. Find **Deploy Chinese Culture Atlas to Cloudflare Pages** for the intended main commit.
3. Confirm the job completed with \`success\`.
4. Open Cloudflare Dashboard → **Workers & Pages** → **chinese-culture** → **Deployments**.
5. Confirm the production deployment references the expected commit.
6. Open [the Pages hostname](https://chinese-culture-79h.pages.dev) and check the home page, collection indexes, a detail page, information pages, assets and 404.
7. Check the apex custom domain. Check \`www\` only after Pages reports its domain validation active.

## Latest verified deployment snapshot

- Workflow run: [#41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872) — success.
- CI run: [#41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795) — success.
- Deployment ID: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Deployed commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Deployment URL: [https://ce2e7daa.chinese-culture-79h.pages.dev](https://ce2e7daa.chinese-culture-79h.pages.dev).

## Local deployment

The \`npm run deploy\` script runs build, verify and \`wrangler pages deploy dist\`. It expects \`CLOUDFLARE_API_TOKEN\` and \`CLOUDFLARE_ACCOUNT_ID\` to be set in the local shell. Do not paste credentials into chat or commit them. Production deployment should normally use the protected GitHub Actions secret.

## Failed deployment

- If build or verification fails, do not attempt deployment. Fix the source and rerun CI.
- If the token preflight fails, check the repository Actions secret name and its validity. Never print the token.
- If Wrangler fails, inspect the action logs for the error without exposing secrets.
- If a deployment is published but faulty, use [rollback procedure](../operations/rollback-procedure.md).

## Important limitation

The latest deployment record is successful, but this documentation snapshot does not claim a completed browser accessibility audit or full \`www\` hostname validation. See [Cloudflare configuration](../operations/cloudflare-configuration.md).
