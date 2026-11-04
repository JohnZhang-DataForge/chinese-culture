# Cloudflare Pages Free Static Deployment

**Status:** Implemented and deployed · **Updated:** 2026-11-05.

## Meaning of Node.js

Node.js runs on developer machines and GitHub Actions to install dependencies and build Astro. The production website is static output served by Cloudflare Pages; no permanent Node.js server runs on Cloudflare.

## Actual release architecture

~~~mermaid
flowchart LR
  A[Private GitHub] --> B[GitHub Actions]
  B --> C[Node.js 22 and Astro]
  C --> D[dist static files]
  D --> E[Wrangler Direct Upload]
  E --> F[Cloudflare Pages Free]
  F --> G[Visitors]
~~~

## Verified project configuration

- Pages project: `chinese-culture`.
- Pages project ID: `7d79fba6-5fed-4f22-bce1-7e46dc5bfd06`.
- Pages hostname: `chinese-culture-79h.pages.dev`.
- Output directory: `./dist`.
- Wrangler compatibility date: `2026-11-04`.
- Production branch: `main`.
- Pages Functions: disabled.
- Latest verified deployment ID: `ce2e7daa-86af-4f55-baed-80730b63e7c7`.
- Deployed source SHA: `539b37c9bfa5363f7149c95563bd549957eeff3d`.

## GitHub Actions

- `site-ci.yml`: pull requests and pushes to main; Node 22, npm install, Astro build and static verification.
- `pages-deploy.yml`: push to main and manual dispatch; builds and verifies, checks `CLOUDFLARE_API_TOKEN`, then runs Wrangler Direct Upload.
- Pull requests do not deploy to production.

## Free-plan discipline

Keep the current site static and re-check Cloudflare's current limits before increasing asset counts or adding server-side code. The existing verifier checks the current Pages file-count and per-file size limits. Do not assume that Workers request quotas apply to static asset requests or that future Functions are free of operational impact.

## References

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
