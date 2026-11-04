# Cloudflare Deployment — Current State and Required Authorization

**Updated:** 2026-11-04  
**Target:** Cloudflare Workers Free + Static Assets  
**Repository:** `JohnZhang-DataForge/chinese-culture`  
**Worker name:** `chinese-culture`  
**Expected URL after deployment:** `https://chinese-culture.yanbo-zhang2035.workers.dev/`

## Verified account state

- Cloudflare account connection works for account ID `dff021f8489d2c316a14575c76de16d4`.
- The account's workers.dev subdomain is `yanbo-zhang2035`.
- GET for Worker `chinese-culture` returned 404 with error 10222: no Worker versions exist. The Worker has not been deployed.
- The Cloudflare account has a Pages project named `chinese-culture` at `chinese-culture-79h.pages.dev`, but it is an empty Direct Upload project: zero deployments and no canonical/latest deployment. It is not the selected Workers architecture.
- Cloudflare rejects changing that Pages project's source with error 8000069 because Direct Upload projects cannot be switched to Git integration. Do not mistake this empty Pages project for the production site.
- Cloudflare API reports an internal issue with the GitHub Pages Git installation (HTTP 401, error 8000011). The Workers Builds repository-connections endpoint returned 404, and the account currently has zero Workers Builds tokens.

## What is ready

- Astro static site source is merged into main.
- Static build has passed CI: 25 pages, 13 guides, 29 output files and 700 internal links checked.
- `wrangler.jsonc` is configured for static assets from `./dist`; no server-side Node process, database or paid service is required.
- The deployment configuration should use build command `npm run build`, deploy command `npx wrangler deploy`, root directory `/`, production branch `main`, and Node.js 22.

## Required one-time account authorization

A Cloudflare account owner must repair/authorize the Cloudflare Workers and Pages GitHub App before Cloudflare can clone the private repository and run Workers Builds.

1. Open [GitHub installed applications](https://github.com/settings/installations).
2. Locate **Cloudflare Workers and Pages** and choose **Configure**.
3. Under repository access, make sure `JohnZhang-DataForge/chinese-culture` is allowed. Prefer selected-repository access rather than granting all repositories.
4. Open [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create).
5. Choose **Create application → GitHub**, authorize the GitHub app if prompted, and select `JohnZhang-DataForge/chinese-culture`.
6. Create the Worker named `chinese-culture`, production branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`, root directory `/`. Enable workers.dev.
7. If Cloudflare still reports the Git installation internal error, the Cloudflare app may need to be reinstalled. Uninstalling the app can revoke access for other repositories/projects too, so review its existing repository access before doing this.

Once the owner has completed the authorization and repository connection, verify the Worker Build run and test the production URL.

## Why this requires an owner action

The connected Cloudflare API integration can inspect and manage account resources but cannot manage the user's API tokens or repair/authorize the GitHub OAuth app installation. The GitHub App authorization is an interactive consent step. Do not ask the user to paste API tokens into chat or commit secrets.

## Release rule

Do not claim deployment success until:
- Cloudflare reports a successful production deployment for the expected Worker.
- The workers.dev URL returns HTTP 200 for `/`.
- At least one nested article route and `/404.html` behavior are checked.
- The deployment commit matches the verified GitHub main commit.
