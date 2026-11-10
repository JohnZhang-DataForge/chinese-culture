# Cloudflare Pages Free — Static Public Delivery and Private Functions

**Status:** Implemented and deployed · **Updated:** 2026-11-11

## Current deployment

- Project: `chinese-culture`
- Production domain: https://chinese-culture.site
- Pages hostname: `chinese-culture-79h.pages.dev`
- Build output: `dist/`
- Framework: Astro 5, `output: static`
- Private endpoints: Cloudflare Pages Functions under `functions/api/admin/v1/`
- Database: Cloudflare D1 binding `CMS_DB`
- Authentication: Cloudflare Access protects Admin and Admin API routes.

Node.js runs in local development and GitHub Actions for build/test. It is not a permanent production server. Public articles remain pre-rendered static assets; only authenticated Admin operations invoke Pages Functions and D1.

## Build and delivery flow

```text
Reviewed source and generated content snapshots on main
  -> GitHub Actions CI
  -> Astro static build + Pages Functions bundle
  -> Wrangler Pages deployment
  -> Cloudflare Pages production
```

A successful source commit, CI run and Pages deployment are separate events. Record each independently.

## Cost and limits

- Static asset delivery is the preferred public path.
- Pages Functions consume Workers quota and should remain limited to authenticated Admin operations.
- D1 has separate storage, read/write and compute limits.
- Keep images below Pages' individual asset limit and total output within Pages file-count limits.
- Recheck Cloudflare's current published limits and account usage before expanding workloads; do not infer live usage from documentation.

See [Cloudflare cost and limit monitoring](../operations/06-cost-and-limit-monitoring.md) and [deployment runbook](../operations/04-cloudflare-deployment.md).

## Security

- Never place Cloudflare tokens, Access secrets or GitHub App private keys in source control.
- Automated tests must use local D1, never production D1.
- GitHub App publication settings remain absent. Do not claim media or publish PR flows are production-accepted until App setup and human-reviewed acceptance complete.


## Current resource guardrails

The Pages Free and Workers/D1 limits are product-plan dependent and may change. Use the live Cloudflare dashboard and the [cost and limit monitoring runbook](../operations/06-cost-and-limit-monitoring.md) as the operational reference. The current static build verifier enforces the Pages output file-count and individual asset-size guardrails. Pages Functions should remain limited to protected Admin operations; normal public page requests must not invoke Functions or D1.
