# Chinese Culture Atlas

**Status: MVP implementation in progress — not yet deployed publicly.**  
**Repository:** Private GitHub · **Hosting target:** Cloudflare Workers Free / Static Assets · **Framework:** Astro (static output) + Node.js build tooling.

A welcoming educational website for exploring Chinese culture through beginner lessons, art, traditions, festivals and literary reading guides.

## Current implementation

- Responsive home page and primary navigation.
- Four content libraries: **Learn**, **Culture**, **Festivals**, **Books**.
- A beginner curriculum, source-linked editorial articles and reading guides stored as Markdown.
- **Events** page with an honest empty state: no unverified event listings.
- About, Contact (public channel pending), editorial policy, privacy, accessibility and 404 pages.
- Cloudflare Workers Free deployment configuration with static assets only; no server adapter, SSR, database or visitor accounts.
- GitHub Actions workflow for building and checking static output.

## Start locally

Requires a supported Node.js version (CI uses Node 22).

1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev` to preview locally.
4. Run `npm run build` to generate `dist/`.
5. Run `npm run verify` to validate required routes and Cloudflare Free static limits.

The website is **not deployed** just because the Wrangler configuration exists. Cloudflare account authorization and release checks are still required.

## Cloudflare deployment later

After the local/CI build passes and the Cloudflare account is ready, an authorized operator may run `npx wrangler login` then `npm run deploy`. This deploys **static assets** from `dist/` under the Worker name in `wrangler.jsonc`; no permanent Node.js process is created. Confirm the chosen `workers.dev` hostname and account before launching.

See [Developer runbook](docs/implementation/05-developer-runbook.md) for all deployment gates. Do not store tokens or secrets in source control.

## Project map

- `src/pages/` — Astro routes and public informational pages.
- `src/layouts/` — shared website shell and navigation.
- `src/components/` — reusable story card.
- `src/styles/` — responsive, accessible design system.
- `src/content/` — reviewed Markdown teaching content.
- `src/content.config.ts` — content metadata definitions.
- `src/lib/` — section metadata and route mappings.
- `public/` — favicon, static headers and robots rules.
- `scripts/` — static-output verification.
- `.github/workflows/` — build-only CI.
- `docs/` — product plans, architecture decisions, structure, implementation history and operations.

## Documents

- [Documentation index](docs/README.md)
- [Implementation status and limitations](docs/implementation/04-implementation-status.md)
- [Complete repository map](docs/architecture/07-implemented-repository-map.md)
- [Markdown schema and routing](docs/architecture/08-content-schema-and-routing.md)
- [Developer and deployment runbook](docs/implementation/05-developer-runbook.md)
- [Cloudflare Free hosting architecture](docs/architecture/06-cloudflare-free-node-deployment.md)
- [Test strategy](docs/implementation/06-test-strategy.md)
- [Change log](docs/operations/03-change-log.md)

## Editorial principles

Culture is diverse and continually changing. Articles should use original prose, distinguish folklore from documented history, acknowledge regional variation and cite reputable educational references. No copyrighted books or photographs are reproduced without permission.

## Not included yet

Public Cloudflare deployment, domain setup, formal accessibility evaluation, public contact details, translated content, ticket registration, accounts, newsletters, dynamic APIs or a database. These must not be presented as complete.
