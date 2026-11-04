# Developer Runbook — Astro and Cloudflare Pages Free

**Status:** Astro static site is implemented and CI-tested. The Cloudflare Pages Direct Upload project exists; its first production deployment is awaiting a one-time upload or protected API token.

## Prerequisites

- GitHub repository read/write access as appropriate.
- Node.js 22 (used in CI), npm and Git.
- Cloudflare account with the Pages Free plan.

## Local development

1. Clone `JohnZhang-DataForge/chinese-culture`.
2. Run `npm install` in the repository root.
3. Run `npm run dev`, then open the local URL printed by Astro.
4. Edit Astro pages in `src/pages/` or Markdown in `src/content/`.
5. Run `npm run build`; prerendered output goes to `dist/`.
6. Run `npm run verify`; this checks core routes, static output, file count and asset sizes.

Do not commit `node_modules/`, `dist/`, `.env` files or Cloudflare credentials.

## CI behavior

`.github/workflows/site-ci.yml` runs on pull requests and pushes to `main`. It installs dependencies, builds Astro, runs the static verifier and publishes a short-lived `chinese-culture-dist` artifact for main pushes. The separate Pages deployment workflow is credential-gated. A committed lockfile and `npm ci` conversion remain a reproducibility improvement.

Latest verified build: [GitHub Actions run #41829806975](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41829390039). It completed install, Astro build, static verification and artifact packaging successfully.

## Cloudflare Pages project

The Cloudflare Pages project has already been created:

- Project: `chinese-culture`
- Production branch: `main`
- Public hostname: [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev)
- Upload mode: Direct Upload (Wrangler or dashboard ZIP upload)
- Current state: project provisioned, no production deployment yet

The Cloudflare Git integration attempt returned an account-side installation error. Direct Upload avoids that integration and keeps the site fully static. A Direct Upload project cannot later be converted to Git integration; this is intentional because GitHub Actions will build the site and Wrangler will publish the prebuilt files.

## First deployment — quickest path without creating an API token

A validated ZIP is available as the `chinese-culture-dist` artifact in the latest successful main-branch CI run. It contains only the 29 public files generated from `dist/`; it does not contain the private source repository or documentation.

1. Download the `chinese-culture-dist` artifact from the latest successful run.
2. In Cloudflare Dashboard, open **Workers & Pages → Pages → chinese-culture**.
3. Choose **Create a new deployment**, select the **Production** environment, and upload the ZIP.
4. Wait for the deployment to complete, then open [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev).

The ZIP is already structured with the website files at its root. The current package contains 29 files, below the dashboard drag-and-drop limit.

## Automated future deployments

To deploy from GitHub Actions without manually uploading each release:

1. In Cloudflare Dashboard, open **Account API Tokens → Create Token → Custom Token**.
2. Grant the account permission **Cloudflare Pages → Edit** for the intended account only.
3. Create the token. Do not paste it into chat or commit it to the repository.
4. In GitHub, open **JohnZhang-DataForge/chinese-culture → Settings → Secrets and variables → Actions**.
5. Add repository secrets:
   - `CLOUDFLARE_API_TOKEN` — the token just created.
   - `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID.
6. To deploy automatically after future pushes to `main`, add repository variable `CLOUDFLARE_DEPLOY_ENABLED` with value `true`. Otherwise, use the workflow's manual `workflow_dispatch` after the secrets exist.

The workflow **Deploy Chinese Culture Atlas to Cloudflare Pages** rebuilds the site, runs `npm run verify`, then executes:

```bash
wrangler pages deploy dist --project-name=chinese-culture --branch=main
```

For a local deployment, set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the shell, then run `npm run deploy`.

## Verify a release

1. Open [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev).
2. Check the home page, Learn, Culture, Festivals, Books, Events, About, Privacy, Accessibility and a missing route.
3. Check CSS, favicon, HTTPS, mobile navigation and the `_headers` security policy.
4. Confirm the deployment appears as the production deployment for branch `main`.
5. Record deployment ID, source SHA, timestamp and rollback target in the change log.

## Free-plan boundaries

- Static asset requests are free and unlimited when no Pages Functions are invoked.
- Free plan: 500 builds/month, one concurrent build, 20,000 files per site and 25 MiB maximum per file.
- The current build contains 29 files and is comfortably below those limits.
- Do not add a `functions/` directory or Pages Function without a separate cost/privacy review.

Official references: [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/).

## Failure and rollback

If the build fails, fix the code and repeat CI before deployment. If a public release fails, redeploy the last-known-good build from a verified commit. Do not turn on paid Cloudflare products as an automatic workaround.

## Editorial publishing

Add one Markdown file under a content collection, keep metadata valid, cite reliable sources, run build/verify, and request review. See [schema and routes](../architecture/08-content-schema-and-routing.md).

## Cost controls

All reader pages prerender; no SSR adapter, Pages Functions, D1/KV/R2, forms, queues or third-party tracking are enabled. Native Pages static asset requests are free and unlimited. See [Pages limits](https://developers.cloudflare.com/pages/platform/limits/).
