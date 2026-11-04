# Development Guide

## Prerequisites

- GitHub access to the private repository.
- Node.js 20.19 or later; CI currently uses Node.js 22.
- npm and Git.
- A code editor for Astro and Markdown.

The repository does not currently include a committed npm lockfile. Use \`npm install\` as the checked-in workflows do; do not assume \`npm ci\` is available until a lockfile is committed.

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
| \`npm run dev\` | Start local Astro development server |
| \`npm run build\` | Generate static site output in \`dist/\` |
| \`npm run preview\` | Preview the built output locally |
| \`npm run verify\` | Check required routes, static output and internal links |
| \`npm run deploy\` | Build, verify and deploy with Wrangler using local Cloudflare credentials |

The local deploy command requires \`CLOUDFLARE_API_TOKEN\` and \`CLOUDFLARE_ACCOUNT_ID\` in the shell environment. Prefer the protected GitHub Actions deployment workflow for production.

## Source map

- \`src/pages/\`: public page routes.
- \`src/layouts/BaseLayout.astro\`: shared document shell, navigation and footer.
- \`src/components/StoryCard.astro\`: reusable content card.
- \`src/content/\`: Markdown teaching content.
- \`src/content.config.ts\`: Astro collection schema and loaders.
- \`src/lib/sections.ts\`: collection-to-route metadata.
- \`src/styles/global.css\`: global design system.
- \`public/\`: static assets and headers.
- \`scripts/verify-static.mjs\`: static build verifier.
- \`.github/workflows/\`: CI and Pages deployment workflows.

## Change workflow

1. Read the current implementation and relevant architecture documentation.
2. Create a feature branch from current \`main\`.
3. Make a focused change.
4. Run \`npm run build\` and \`npm run verify\`.
5. Review the generated \`dist/\` output when routes or assets change.
6. Open a pull request.
7. Confirm CI passes and request review.
8. Merge only after review; main pushes trigger production deployment.

## Constraints

Keep the project static unless a separately approved architecture change authorizes a runtime feature. Do not add a Cloudflare SSR adapter, Pages Functions, a database, a runtime API or a permanent Node server without an approved design and cost/security review. Do not commit \`node_modules/\`, \`dist/\`, \`.env\` files or credentials.
