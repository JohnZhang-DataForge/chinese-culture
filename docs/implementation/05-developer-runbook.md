# Developer Runbook — Astro and Cloudflare Workers Free

**Status:** Astro source and a free-tier Worker fallback are implemented; the initial public deployment is being completed through the Cloudflare account connection.

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

`.github/workflows/site-ci.yml` runs on pull requests and pushes to main. It installs dependencies with npm, builds and runs the static verifier. **It does not deploy** and does not set Cloudflare secrets. On main pushes, CI also packages the verified `dist/` folder as a short-lived `chinese-culture-dist` artifact for an authorized deployment step. The project needs a committed lockfile and `npm ci` conversion for tighter reproducibility after initial build verification.

## Current deployment mode — embedded static-site Worker

The preferred architecture remains Cloudflare Workers Static Assets (`wrangler.jsonc`): it serves prerendered files without invoking Worker code and static asset requests are free and unlimited. The Cloudflare connection available to this session can create an asset manifest but cannot pass the short-lived upload JWT required by the direct asset-upload endpoint. Cloudflare Pages Git integration also returned an account-side installation error. To complete the initial launch without exposing or requesting credentials, the project includes a fallback that embeds the compressed static build in a small Worker script.

- Build the site with `npm run build`, verify it with `npm run verify`, generate the fallback with `npm run build:worker`, and run `npm run test:worker`.
- Deploy the fallback with `npm run deploy:embedded` after authenticating Wrangler.
- The fallback serves only GET/HEAD, supports directory index routes and a 404 page, and applies the security headers from the site's `_headers` file.
- **Free-plan trade-off:** requests execute Worker code and count against the account-wide Workers Free allowance of 100,000 requests per UTC day (10 ms CPU per request). This is not the unlimited static-asset request path. If traffic grows, switch back to native Workers Static Assets or Pages once the direct-upload authorization or GitHub integration path is available.
- On main pushes, CI publishes one-day `chinese-culture-dist` and `chinese-culture-worker-fallback` artifacts. The latter contains the deployable script only.

## Cloudflare preview / deployment

1. Confirm correct Cloudflare account and Workers Free subscription.
2. For the preferred static-assets deployment, validate that `wrangler.jsonc` points to `./dist` and contains no server entrypoint. For the current fallback, use `wrangler.embedded.jsonc` and the generated `dist-worker/index.js`.
3. Confirm `name: chinese-culture` does not collide with another Worker.
4. With authorized access, run `npx wrangler login` for local interactive authorization, or configure a least-privilege deployment token through approved CI secrets management.
5. Run `npm run build` and `npm run verify`.
6. Run `npx wrangler dev` for local Cloudflare-style preview as needed.
7. Run `npm run deploy` for native Static Assets, or `npm run deploy:embedded` for the current Free fallback, only after content review and a release decision.
8. Visit the reported `*.workers.dev` URL; verify navigation, 404, HTTPS, media and browser behavior.
9. Confirm page routes, CSS, 404, HTTPS and response headers. In fallback mode, each request invokes the Worker; in native Static Assets mode, requests bypass Worker code.
10. Record date, source commit, operator, deployed URL, verified account and rollback procedure in the change log.

**Important:** Creating `wrangler.jsonc` is not a Cloudflare deployment. GitHub CI is intentionally build-only; an operator must supply Cloudflare authorization.

## Failure and rollback

If the build fails, fix the code and repeat CI before deployment. If a public release fails, redeploy the last-known-good version/build from a verified commit. Do not turn on paid Cloudflare products as an automatic workaround.

## Editorial publishing

Add one Markdown file under a content collection, keep metadata valid, cite reliable sources, run build/verify, and request review. See [schema and routes](../architecture/08-content-schema-and-routing.md).

## Avoidable costs

All reader pages prerender; no SSR adapter, D1/KV/R2, forms, queues or third-party tracking. Native Static Assets requests are free and unlimited. The embedded Worker fallback is free within the account-wide 100,000 Worker requests/day allowance. See [Workers Free limits](https://developers.cloudflare.com/workers/platform/limits/).

## Primary sources

- [Cloudflare: deploy Astro static app](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Cloudflare: Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare: Free plan limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Astro: deploy on Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/).
