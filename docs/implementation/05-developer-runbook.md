# Developer Runbook — Astro and Cloudflare Pages Free

**Status:** Astro static site is implemented and CI-tested. Cloudflare Pages Direct Upload project exists; first public deployment is waiting for a protected GitHub Actions API token.

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

## Cloudflare Pages Direct Upload

The Cloudflare Pages project has already been created:

- Project: \`chinese-culture\`
- Production branch: \`main\`
- Public hostname: [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev)
- Upload mode: Direct Upload (Wrangler). This project cannot later be converted to Git integration; that is acceptable because GitHub Actions performs the build and deployment.

The Cloudflare Git integration attempt returned an account-side installation error. The Direct Upload path avoids that integration and keeps the site fully static. Pages static asset requests are free and unlimited when no Pages Functions are invoked.

### One-time credential setup

1. In Cloudflare Dashboard, open **Account API Tokens** and choose **Create Token → Custom Token**.
2. Add only the account permission **Cloudflare Pages → Edit** for the intended Cloudflare account.
3. Create the token. Do not paste it into chat or commit it to the repository.
4. In GitHub, open \`JohnZhang-DataForge/chinese-culture → Settings → Secrets and variables → Actions → New repository secret\`.
5. Add:
   - \`CLOUDFLARE_API_TOKEN\` — the token just created.
   - \`CLOUDFLARE_ACCOUNT_ID\` — the account ID supplied by Cloudflare.
6. To enable automatic deployment on future pushes to \`main\`, add repository variable \`CLOUDFLARE_DEPLOY_ENABLED\` with value \`true\`. Otherwise, use the workflow's manual \`workflow_dispatch\` after the secrets exist.

### Deploy

- Local: \`npm run deploy\` (requires Wrangler authentication through \`CLOUDFLARE_API_TOKEN\` and \`CLOUDFLARE_ACCOUNT_ID\`).
- GitHub Actions: run **Deploy Chinese Culture Atlas to Cloudflare Pages** from the Actions tab on branch \`main\`.
- The workflow rebuilds, runs \`npm run verify\`, then executes \`wrangler pages deploy dist --project-name=chinese-culture --branch=main\`.

### Verify release

1. Open [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev).
2. Check home, Learn, Culture, Festivals, Books, Events, About, Privacy, Accessibility and a missing route.
3. Check CSS, favicon, HTTPS, mobile navigation and the \`_headers\` security policy.
4. Confirm the deployment appears as the production deployment for branch \`main\`.
5. Record deployment ID, source SHA, timestamp and rollback target in the change log.

### Free-plan boundaries

- Static asset requests are free and unlimited when no Pages Functions are invoked.
- Free plan: 500 builds/month, one concurrent build, 20,000 files per site and 25 MiB maximum per file.
- The current build contains 29 files and is comfortably below those limits.
- Do not add a \`functions/\` directory or Pages Function without a separate cost/privacy review.

Official references: [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/).

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
