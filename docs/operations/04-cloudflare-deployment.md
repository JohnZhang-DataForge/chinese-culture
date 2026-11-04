# Cloudflare Pages Deployment — Current State and Release Steps

**Updated:** 2026-11-05  
**Target:** Cloudflare Pages Free, Direct Upload  
**Repository:** `JohnZhang-DataForge/chinese-culture`  
**Project:** `chinese-culture`  
**Production URL:** [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev)  
**Cloudflare account ID:** `dff021f8489d2c316a14575c76de16d4`

## Verified account and repository state

- The Cloudflare connection can access the intended account and Pages project.
- The Pages project `chinese-culture` exists and its production branch is `main`.
- The Pages deployments API currently returns an empty list; `latest_deployment` and `canonical_deployment` are null. The site is not yet publicly deployed.
- The Cloudflare Git integration attempt returned account-side error `8000011`. A Direct Upload project cannot be converted to Git integration (error `8000069` when attempting to change its `source` object).
- GitHub Actions build CI passed on main commit `2e4417a7a6bd9e556d6bc63b0a0e57219d3ef334`: 25 generated pages, 29 output files, 700 internal links and a deployable `chinese-culture-dist` artifact.
- The deploy workflow on main was correctly skipped because repository variable `CLOUDFLARE_DEPLOY_ENABLED` is not set to `true`. It can also be run manually after the API token secret is added.

## Selected release path: GitHub Actions + Wrangler Direct Upload

The website remains a pure static Astro build deployed to Cloudflare Pages Free. We do not need Cloudflare's GitHub App integration. GitHub Actions checks out the private source, builds Astro, verifies the output, then Wrangler uploads `dist/` to the existing Pages project.

The connected Cloudflare API can inspect the Pages project and issue a short-lived upload JWT, but the subsequent asset-upload request requires that JWT in a custom Authorization header. The current connected API action does not expose that header override, so this session cannot complete the raw asset upload directly. The supported CI route below uses Wrangler and a protected API token.

## One-time owner action

Create a least-privilege account API token and add it to GitHub:

1. In Cloudflare Dashboard, open **Manage Account → Account API Tokens**.
2. Choose **Create Token** and use the account-owned token flow.
3. Grant only the **Pages Write** role.
4. Restrict the token to the account with ID `dff021f8489d2c316a14575c76de16d4`. Do not grant Zone, DNS, Workers or unrelated permissions.
5. Create the token and copy it to a secure password manager. Cloudflare displays the secret only once.
6. In GitHub, open [repository Actions secrets](https://github.com/JohnZhang-DataForge/chinese-culture/settings/secrets/actions).
7. Add repository secret `CLOUDFLARE_API_TOKEN` with the token value.

The workflow already contains the non-secret account ID. No `CLOUDFLARE_ACCOUNT_ID` secret is needed. Never paste the API token into chat or commit it to the repository.

If account-owned API tokens are not available, an account administrator with API Token Provisioning or Super Administrator access must create the token.

## Trigger the first deployment

1. Open [GitHub Actions](https://github.com/JohnZhang-DataForge/chinese-culture/actions).
2. Select **Deploy Chinese Culture Atlas to Cloudflare Pages**.
3. Choose **Run workflow** on branch `main`.
4. Wait for install, Astro build, static verification and Wrangler deployment to complete.
5. Open the production URL and run the release checks below.

To deploy automatically on future pushes to `main`, add repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`. Otherwise, keep production deployment manual.

## Release verification

Do not claim production success until all of the following are confirmed:

- GitHub Actions deployment job completed successfully.
- Cloudflare Pages shows a production deployment for branch `main`.
- Deployment commit SHA matches the main commit used for the build.
- Homepage returns HTTP 200 over HTTPS.
- A nested route such as `/learn/` and an article route load correctly.
- CSS, favicon, robots.txt and security headers are served.
- A missing route returns the designed 404 page.
- Mobile navigation and keyboard focus are checked in a browser.

Record deployment ID, commit SHA, deployment time and rollback target in the change log.

## Rollback

If the new deployment fails browser smoke tests, use Cloudflare Pages deployment history to promote/redeploy the last-known-good deployment. Do not delete the project or change its Direct Upload mode as a troubleshooting shortcut.

## References

- [Cloudflare account-owned API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/)
- [Cloudflare Pages API token roles](https://developers.cloudflare.com/workers/authorization/workers/)
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
