# Developer Runbook — Astro and Cloudflare Pages Free

**Status:** Astro static site is implemented and CI-tested. The Cloudflare Pages Direct Upload project exists; its first production deployment is awaiting one protected Pages Write API token.

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

`.github/workflows/site-ci.yml` runs on pull requests and pushes to `main`. It installs dependencies, builds Astro, runs the static verifier and publishes a short-lived `chinese-culture-dist` artifact for main pushes. The separate Pages deployment workflow uses Wrangler Direct Upload and is credential-gated. A committed lockfile and `npm ci` conversion remain a reproducibility improvement.

Latest verified build: [GitHub Actions run #41830613564](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41830613564). It completed install, Astro build, static verification and artifact packaging successfully.

## Cloudflare Pages project

- Project: `chinese-culture`
- Production branch: `main`
- Public hostname: [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev)
- Upload mode: Direct Upload (Wrangler or dashboard ZIP upload)
- Current state: project provisioned, no production deployment yet

The Cloudflare Git integration attempt returned an account-side installation error. This does not block Direct Upload. GitHub Actions builds the site and Wrangler publishes the prebuilt files, so no Cloudflare GitHub App authorization is required.

## One-time API token setup

To enable the automated deployment workflow:

1. In Cloudflare Dashboard, open **Manage Account → Account API Tokens**.
2. Choose **Create Token** and select the account-owned token flow.
3. Grant the **Pages Write** role only. Scope it to the account that owns the `chinese-culture` Pages project. Do not grant Zone, Workers, DNS or unrelated permissions.
4. Create the token and copy it directly to a secure location. Cloudflare shows the token only once.
5. In GitHub, open **JohnZhang-DataForge/chinese-culture → Settings → Secrets and variables → Actions**.
6. Add one repository secret:
   - `CLOUDFLARE_API_TOKEN` — the Pages Write token just created.

The Cloudflare account ID is already configured in `.github/workflows/pages-deploy.yml`; it is an identifier, not a secret. Do not add it as another GitHub secret and do not paste the API token into ChatGPT or source control.

If the account-owned token option is unavailable, an account administrator with API Token Provisioning or Super Administrator access must create the token.

## First production deployment

1. Open the repository's **Actions** tab.
2. Select **Deploy Chinese Culture Atlas to Cloudflare Pages**.
3. Choose **Run workflow**, select branch `main`, and start the run.
4. Confirm the build, static verification and Wrangler Direct Upload steps all succeed.
5. Open [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev).

Every push to `main` triggers this deployment workflow. Pull requests do not deploy. The credential check fails early if the repository secret is missing.

For a local deployment, set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the shell, then run `npm run deploy`. Never commit either value.

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

See [Cloudflare deployment status](../operations/04-cloudflare-deployment.md) for the verified account state and release evidence.
