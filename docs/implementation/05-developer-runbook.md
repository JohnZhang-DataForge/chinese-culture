# Developer Runbook — Astro and Cloudflare Workers Free

**Status:** Implemented source; deployment requires explicit Cloudflare authorization.

## Prerequisites

- GitHub repository read/write access as appropriate.
- Node.js 22 (used in CI; compatible supported Node versions are declared in package metadata).
- npm and Git.
- For deployment only: access to the intended Cloudflare account with a Workers Free plan.

## Local development

1. Clone `JohnZhang-DataForge/chinese-culture`.
2. Run `npm install` in the root.
3. Run `npm run dev`, then open the local URL printed by Astro.
4. Edit Astro pages in `src/pages/` or Markdown in `src/content/`.
5. Run `npm run build`; prerendered output goes to `dist/`.
6. Run `npm run verify`; this checks core routes, lack of Worker SSR entrypoint, Free file count and asset sizes.

Do not commit `node_modules/`, `dist/`, `.env` files or Cloudflare credentials.

## CI behavior

`.github/workflows/site-ci.yml` runs on pull requests and pushes to main. It installs dependencies with npm, builds and runs the static verifier. **It does not deploy** and currently does not set Cloudflare secrets. The project needs a committed lockfile and `npm ci` conversion for tighter reproducibility after initial build verification.

## Cloudflare preview / deployment (not yet performed)

1. Confirm correct Cloudflare account and Workers Free subscription.
2. Validate that `wrangler.jsonc` points to `./dist` and contains **no `main` server entrypoint**.
3. Confirm `name: chinese-culture` does not collide with another Worker.
4. With authorized access, run `npx wrangler login` for local interactive authorization, or configure a least-privilege deployment token through approved CI secrets management.
5. Run `npm run build` and `npm run verify`.
6. Run `npx wrangler dev` for local Cloudflare-style preview as needed.
7. Run `npm run deploy` only after content review and a release decision.
8. Visit the reported `*.workers.dev` URL; verify navigation, 404, HTTPS, media and browser behavior.
9. Confirm ordinary pages are delivered as static assets without Worker script requests.
10. Record date, source commit, operator, deployed URL, verified account and rollback procedure in the change log.

**Important:** Creating `wrangler.jsonc` is not a Cloudflare deployment. GitHub CI is intentionally build-only; an operator must supply Cloudflare authorization.

## Failure and rollback

If the build fails, fix the code and repeat CI before deployment. If a public release fails, redeploy the last-known-good version/build from a verified commit. Do not turn on paid Cloudflare products as an automatic workaround.

## Editorial publishing

Add one Markdown file under a content collection, keep metadata valid, cite reliable sources, run build/verify, and request review. See [schema and routes](../architecture/08-content-schema-and-routing.md).

## Avoidable costs

All reader pages prerender; no SSR adapter, D1/KV/R2, forms, queues or third-party tracking. Current Static Assets requests are free and unlimited, while dynamic Worker requests consume a daily Free quota. Validate pricing before release.

## Primary sources

- [Cloudflare: deploy Astro static app](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Cloudflare: Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare: Free plan limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Astro: deploy on Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/).
