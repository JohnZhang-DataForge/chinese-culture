# Deployment Guide

**Current production path:** GitHub Actions + Wrangler Direct Upload to Cloudflare Pages Free.

## Automatic Pages deployment

A push to `main` triggers:

1. `site-ci.yml`: install, build, static verification and a short-lived build artifact.
2. `pages-deploy.yml`: install, build, static verification, credential preflight and Wrangler Direct Upload.

Pull requests run CI but do not deploy production. The Pages workflow can also be manually dispatched on `main`.

## Required credential

The repository Actions secret `CLOUDFLARE_API_TOKEN` must contain a least-privilege Cloudflare token with Pages Write permission for the account hosting this project. Never place its value in source control or documentation.

The workflow contains the Cloudflare account ID directly in YAML. It is an identifier, not a secret.

## Verify a Pages deployment

1. Open [GitHub Actions](https://github.com/JohnZhang-DataForge/chinese-culture/actions).
2. Find **Deploy Chinese Culture Atlas to Cloudflare Pages** for the intended main commit.
3. Confirm the job completed with `success`.
4. Open Cloudflare Dashboard → **Workers & Pages** → **chinese-culture** → **Deployments**.
5. Confirm the production deployment references the expected commit.
6. Open [the Pages hostname](https://chinese-culture-79h.pages.dev) and check home, collection indexes, detail pages, assets and 404.
7. Check both custom domains and the canonical redirect behavior.

## Latest verified Pages deployment

- Workflow run: [#41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872) — success.
- CI run: [#41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795) — success.
- Deployment ID: `ce2e7daa-86af-4f55-baed-80730b63e7c7`.
- Deployed commit: `539b37c9bfa5363f7149c95563bd549957eeff3d`.
- Deployment URL: [https://ce2e7daa.chinese-culture-79h.pages.dev](https://ce2e7daa.chinese-culture-79h.pages.dev).

## Domain status

Cloudflare Pages API now reports both `chinese-culture.site` and `www.chinese-culture.site` as active, with verification and HTTP validation active. The Universal SSL certificate pack is active and covers apex and wildcard. Cloudflare redirect rules implement www-to-apex and apex HTTP-to-HTTPS while excluding the ACME validation path.

An external HTTP/TLS smoke test has not been completed from the current execution environment because its DNS resolver could not resolve the tested hosts. Run the commands in [Domain DNS Change Log](../operations/domain-dns-change-log.md) from a normal workstation before declaring external hostname verification complete.

## Local Pages deployment

The `npm run deploy` script runs build, verify and `wrangler pages deploy dist`. It expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the local shell. Do not paste credentials into chat or commit them.

## Future Admin Worker deployment

Agent 0's Proposed design specifies a separate Cloudflare Worker for `/api/admin/v1/*`, not Pages Functions. No production Admin Worker is verified in current `main`. Its deployment workflow and credentials must be documented after Agent 5's implementation is reconciled with the frozen contract.

## Failed deployment

- If build/verification fails, do not attempt deployment.
- If token preflight fails, check the repository secret name and validity without printing the token.
- If Wrangler fails, inspect logs without exposing credentials.
- If a faulty production deployment exists, use [rollback procedure](../operations/rollback-procedure.md).
