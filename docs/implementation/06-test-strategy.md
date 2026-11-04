# Test Strategy and Quality Gates

**Status:** Static build and route verification implemented; browser E2E and formal accessibility audit not yet implemented.

## Automated checks

The workflow \`.github/workflows/site-ci.yml\` runs on pull requests and pushes to \`main\`:

1. Checkout source.
2. Set up Node.js 22.
3. Install dependencies with npm.
4. Run \`npm run build\`.
5. Run \`npm run verify\`.
6. On main pushes, upload a short-lived \`chinese-culture-dist\` artifact.

The separate Pages deployment workflow repeats build and verify, checks the protected Cloudflare token and uploads \`dist/\` using Wrangler.

## Static verifier coverage

\`scripts/verify-static.mjs\` checks required routes, no SSR Worker output, Pages build directory, project name, absence of a Worker entrypoint, file count, per-file size, homepage branding, internal local links and a minimum of 13 educational pages.

## Latest evidence

- [CI run #41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795) — success on main commit \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- [Pages deployment run #41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872) — success.
- Detailed prior verifier output: 25 generated pages, 13 guides, 29 files and 700 local links in [run #41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724).

## Not currently automated

No Playwright package, browser test runner, bilingual route tests, admin/API/auth tests, upload tests, visual regression or accessibility automation is present in the inspected package/workflows.

## Manual release checks

Check page rendering at desktop and mobile sizes, navigation by keyboard and touch, skip link and focus state, 200% zoom, headings, contrast, Chinese glyph rendering, external links, image rights, Events empty state, 404 behavior, browser console, HTTPS, response headers, custom-domain validation and deployment commit SHA.

See [Testing Guide](testing-guide.md) for the current checklist.
