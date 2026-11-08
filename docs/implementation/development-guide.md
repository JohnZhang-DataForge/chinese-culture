# Development Guide

## Prerequisites

- GitHub access to the private repository.
- Node.js 20.19 or later; CI currently uses Node.js 22.
- npm and Git.
- An editor suitable for Astro and Markdown.

The repository does not currently include a committed npm lockfile. Use `npm install` as the checked-in workflows do; do not assume `npm ci` is available until a lockfile is committed.

## Local setup

~~~bash
git clone https://github.com/JohnZhang-DataForge/chinese-culture.git
cd chinese-culture
npm install
npm run dev
~~~

Open the local URL printed by Astro.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start local Astro development server |
| `npm run build` | Generate static output in `dist/` |
| `npm run preview` | Preview the built output locally |
| `npm run verify` | Check required routes, static output and internal links |
| `npm run deploy` | Build, verify and deploy with Wrangler using local Cloudflare credentials |

The local deploy command requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the shell environment. Prefer the protected GitHub Actions workflow for production.

## Source map

- `src/pages/`: public Astro routes.
- `src/layouts/BaseLayout.astro`: shared document shell, navigation and footer.
- `src/components/StoryCard.astro`: reusable content card.
- `src/content/`: Markdown teaching content.
- `src/content.config.ts`: collection schema and loaders.
- `src/lib/sections.ts`: section-to-collection route metadata.
- `src/styles/global.css`: global design system.
- `public/`: static assets and headers.
- `scripts/verify-static.mjs`: static build verifier.
- `.github/workflows/`: CI and Pages deployment workflows.

## Change workflow

1. Read the current implementation and relevant contracts.
2. Create a feature branch from latest `main`.
3. Change only the files in your ownership area.
4. Run `npm run build` and `npm run verify`.
5. Review generated `dist/` output when routes/assets change.
6. Open a pull request, wait for CI and request review.
7. Merge only after review; main pushes trigger Pages deployment.

## Agent integration

Agent 0's shared contracts are in an open Proposed PR, not Ready yet. Do not implement against guessed locale paths, content fields or API paths. Agent 5's backend branch currently conflicts with the proposed separate Worker architecture; Agent 6's test paths also need to align with the proposed `/zh-cn/` segment.

Agent 6's open QA PR adds Playwright and unit-test tooling, but those changes are not part of current `main`. Follow the commands in the QA guide only after that PR is merged.

## Constraints

Keep public pages static. Do not add a Pages Functions directory or SSR adapter as a shortcut for the proposed CMS; Agent 0's target uses a separate Worker. Do not add a database or paid service without an approved design and cost/security review. Do not commit `node_modules/`, `dist/`, `.env` files or credentials.
