# Chinese Culture Atlas

**Status:** English-language MVP implemented and deployed to Cloudflare Pages Free. Bilingual localization and the GitHub-backed Admin CMS are in progress as separate agent PRs; they are not yet released.  
**Repository:** Private GitHub · **Production target:** [https://chinese-culture.site](https://chinese-culture.site) · **Framework:** Astro 5 static output + Node.js build tooling.

A welcoming educational website for exploring Chinese culture through beginner lessons, art, traditions, festivals and literary reading guides.

## Current implementation

- Responsive English home page and primary navigation.
- Four content libraries: **Learn**, **Culture**, **Festivals**, **Books**.
- Beginner curriculum, source-linked editorial articles and reading guides stored as Markdown.
- **Events** page with an honest empty state; no unverified event listings.
- About, Contact (public channel pending), editorial policy, privacy, accessibility and 404 pages.
- Cloudflare Pages Free Direct Upload; static assets only, no SSR adapter, Pages Functions, database or visitor accounts in current main.
- GitHub Actions CI and automatic Pages deployment on pushes to `main`.

## Production deployment

The Pages project `chinese-culture` is deployed at [chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev).

Latest verified production deployment:
- Deployment ID: `ce2e7daa-86af-4f55-baed-80730b63e7c7`.
- Source commit: `539b37c9bfa5363f7149c95563bd549957eeff3d`.
- [Pages deployment workflow run](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872): success.
- [Static CI run](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795): success.

Cloudflare Pages API reports both `chinese-culture.site` and `www.chinese-culture.site` custom domains active, with HTTP validation active and an active Universal SSL certificate. The canonical redirect rules send `www` to the HTTPS apex and apex HTTP to HTTPS, preserving path/query and excluding the ACME validation path. An external HTTP/TLS smoke test is still outstanding because the execution environment could not resolve the public hostnames.

## Start locally

Requires Node.js >=20.19 (CI uses Node 22).

~~~bash
git clone https://github.com/JohnZhang-DataForge/chinese-culture.git
cd chinese-culture
npm install
npm run dev
npm run build
npm run verify
~~~

## Cloudflare Pages deployment

The site uses Cloudflare Pages Free Direct Upload. GitHub Actions uses repository secret `CLOUDFLARE_API_TOKEN` with the minimum Pages Write permission. The account ID is configured in the workflow and is not a secret.

Pull requests run CI only. A push to `main` triggers the Pages deployment workflow. See [Deployment Guide](docs/implementation/deployment-guide.md) and [GitHub Token Setup](docs/operations/github-token-setup.md). Never paste the token into chat or commit it.

## Project map

- `src/pages/` — Astro routes and public information pages.
- `src/layouts/` — shared website shell and navigation.
- `src/components/` — reusable story card.
- `src/styles/` — responsive design system.
- `src/content/` — reviewed Markdown teaching content.
- `src/content.config.ts` — content metadata definitions.
- `src/lib/` — section metadata and route mappings.
- `public/` — favicon, static headers and robots rules.
- `scripts/` — static-output verification.
- `.github/workflows/` — build/verification CI and Pages deployment.
- `docs/` — architecture, implementation, operations and planning documentation.

## Documents

- [Documentation index](docs/README.md)
- [Implementation status](docs/implementation/implementation-status.md)
- [System overview](docs/architecture/system-overview.md)
- [Cloudflare Pages architecture](docs/architecture/cloudflare-pages-architecture.md)
- [Content management guide](docs/implementation/content-management-guide.md)
- [Administrator user guide](docs/implementation/admin-user-guide.md)
- [Deployment guide](docs/implementation/deployment-guide.md)
- [Testing guide](docs/implementation/testing-guide.md)
- [Cloudflare configuration](docs/operations/cloudflare-configuration.md)
- [Rollback procedure](docs/operations/rollback-procedure.md)

## Bilingual CMS program

Agent 0's [OpenSpec proposal and shared contracts PR #3](https://github.com/JohnZhang-DataForge/chinese-culture/pull/3) is Proposed and not Ready/merged. It proposes English and Simplified Chinese routes, a shared content ID/schema, a protected Admin UI, a separate Cloudflare Worker, GitHub App access and PR-based publishing. Agent 4's draft UI, Agent 5's backend branch and Agent 6's QA work are still being integrated. See [Implementation Status](docs/implementation/implementation-status.md) for current dependencies and conflicts.

## Editorial principles

Culture is diverse and continually changing. Articles should use original prose, distinguish folklore from documented history, acknowledge regional variation and cite reputable educational references. No copyrighted books or photographs are reproduced without permission.
