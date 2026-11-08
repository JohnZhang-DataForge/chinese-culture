# Deployment and Environments

**Status:** Implemented — Cloudflare Pages Direct Upload.

This file replaces the earlier future-only deployment plan. See [Deployment Guide](../implementation/deployment-guide.md) and [Cloudflare Pages Architecture](cloudflare-pages-architecture.md) for the operational procedure.

## Environments

| Environment | Current purpose |
|---|---|
| Local | Astro development server and static preview |
| CI | GitHub Actions build and static verification |
| Production | Cloudflare Pages project `chinese-culture` |
| Preview | Cloudflare Pages preview deployment capability exists at platform level; a dedicated project-specific preview release process is not documented here |

## Production release

A push to `main` triggers CI and the Pages deployment workflow. Wrangler uploads `dist/` to the existing Direct Upload project. Pull requests run CI only.

## Current production evidence

- Successful deployment: `ce2e7daa-86af-4f55-baed-80730b63e7c7`.
- Source commit: `539b37c9bfa5363f7149c95563bd549957eeff3d`.
- Pages hostname: `chinese-culture-79h.pages.dev`.
- Pages Functions: disabled.
- Apex custom domain: active.
- WWW custom domain: pending validation.

## Rollback

Use Cloudflare Pages deployment rollback when a known-good prior deployment exists. Otherwise, use a reviewed Git revert that triggers a new deployment. See [Rollback Procedure](../operations/rollback-procedure.md).

## Runtime boundary

No permanent Node server, SSR adapter, Pages Functions, database or background job is deployed. Introducing any of these requires a reviewed architecture and security/cost decision.
