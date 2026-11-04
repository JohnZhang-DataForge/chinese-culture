# Testing Guide

## Current main CI

The repository has two current workflows:

- `.github/workflows/site-ci.yml`: pull requests and pushes to `main`.
- `.github/workflows/pages-deploy.yml`: pushes to `main` and manual dispatch.

They use Node.js 22, `npm install`, `npm run build` and `npm run verify`. The deployment workflow additionally checks `CLOUDFLARE_API_TOKEN` and publishes with Wrangler.

## Static verifier coverage

`scripts/verify-static.mjs` checks:

- Build output directory exists.
- Required public route files exist.
- No `dist/_worker.js` is emitted.
- `wrangler.jsonc` points to the expected Pages project and `./dist`.
- No Worker entrypoint is configured in the Pages project config.
- Generated file count and individual asset size remain within checked Pages limits.
- Homepage branding exists.
- Local links in generated HTML resolve to generated files/routes.
- At least 13 educational content pages are generated.

This is a static-output check, not a browser test.

## Latest evidence

- [CI run #41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795): success on main commit `539b37c9bfa5363f7149c95563bd549957eeff3d`.
- [Pages deployment run #41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872): success.
- Detailed prior verifier output: 25 generated pages, 13 guides, 29 files and 700 local links in [run #41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724).

## Agent 6 QA PR — not yet merged

Agent 6 PR #6 adds a separate Playwright/Chromium workflow, public-route smoke tests, unit tests for a CMS mutation safety gate, and conditional bilingual/Admin API tests. The PR states that feature-specific tests are skipped until the corresponding implementations are integrated. CMS mutations are disabled by default and block production hostnames.

Important integration mismatch: current Agent 6 localization tests refer to `/zh/`, while Agent 0's Proposed contract specifies `/zh-cn/`. Align tests before the bilingual acceptance gate is enabled. Do not report conditional or skipped tests as PASS.

## Not currently automated in main

- Playwright/browser E2E.
- Bilingual route and switcher tests.
- Admin UI/API/auth tests.
- Media upload tests.
- Browser-level custom-domain smoke tests.
- Formal screen-reader/accessibility audit.
- Visual regression tests.

## Manual pre-release checklist

- [ ] Home, collection indexes and representative detail pages load.
- [ ] Events page displays its honest empty state.
- [ ] About, Contact, Editorial Policy, Privacy and Accessibility pages load.
- [ ] 404 behavior is correct.
- [ ] Header/mobile navigation work with mouse, touch and keyboard.
- [ ] Focus indicators and skip link are usable.
- [ ] Text remains readable at mobile widths and 200% zoom.
- [ ] Contrast and heading hierarchy are reviewed.
- [ ] Chinese characters display correctly.
- [ ] External sources and image rights are checked.
- [ ] No unexpected console errors or third-party trackers appear.
- [ ] Apex and www HTTPS/redirect behavior is tested externally.
- [ ] Deployment commit SHA matches intended `main`.

## Run current checks locally

~~~bash
npm install
npm run build
npm run verify
npm run preview
~~~

After Agent 6's QA PR is merged, follow its test commands and reports in addition to the static verifier.
