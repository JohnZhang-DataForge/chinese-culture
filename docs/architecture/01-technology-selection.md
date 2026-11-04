# Technology Selection — Implemented Static Site

**Status:** Accepted implementation baseline · **Updated:** 2026-11-05.

## Current stack

| Component | Actual implementation |
|---|---|
| Content framework | Astro 5, static output |
| Build runtime | Node.js 22 in GitHub Actions; Node.js >=20.19 in package engines |
| Package tooling | npm |
| Static hosting | Cloudflare Pages Free, Direct Upload |
| Deployment | GitHub Actions with Wrangler Direct Upload |
| Source control | Private GitHub repository and pull requests |
| Content | Astro Markdown collections |
| Data store | None |
| Runtime API | None |
| SSR / Pages Functions | None |

## Important platform distinction

The deployed project is **Cloudflare Pages**, not a Cloudflare Workers Static Assets project. The Pages project reports \`uses_functions=false\`. Node.js runs during development and CI builds; it is not a persistent production server.

Cloudflare currently recommends Workers for new projects, but this repository already has a Pages Direct Upload project and a successful production deployment. Do not migrate hosting as part of an unrelated documentation change.

## Why static output

The current site is an educational content site. Prerendering the pages avoids a runtime database and server process, keeps the deployment simple and fits the intended low-cost hosting model.

## Current deployment evidence

See [Cloudflare Pages architecture](cloudflare-pages-architecture.md) and [Cloudflare configuration](../operations/cloudflare-configuration.md). The current successful deployment is tied to main commit \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.

## Deferred capabilities

Admin APIs, account management, database storage, forms, media upload, full localization and SSR are not part of the current source. They require approved architecture and security/cost review before implementation.
