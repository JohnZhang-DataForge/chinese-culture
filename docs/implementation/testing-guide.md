# Testing Guide

## Automated CI

The repository has two workflows:

- \`.github/workflows/site-ci.yml\`: pull requests and pushes to \`main\`.
- \`.github/workflows/pages-deploy.yml\`: pushes to \`main\` and manual dispatch.

Both workflows use Node.js 22, \`npm install\`, \`npm run build\` and \`npm run verify\`. The deployment workflow additionally checks \`CLOUDFLARE_API_TOKEN\` and publishes with Wrangler.

## Static verifier coverage

\`scripts/verify-static.mjs\` checks:

- The build output directory exists.
- Required public route files exist.
- No \`dist/_worker.js\` is emitted.
- \`wrangler.jsonc\` points to the correct Pages project and \`./dist\`.
- No Worker entrypoint is configured in the Wrangler file.
- Generated file count and individual asset size remain within the checked Pages Free limits.
- Homepage branding exists.
- Local links in generated HTML resolve to a generated file/route.
- At least 13 educational content pages are generated.

The verifier is a Node script over static build output. It does not launch a browser.

## Latest CI evidence

- [Run #41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795): completed successfully on main commit \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Earlier detailed verifier evidence recorded 25 generated pages, 13 educational guides, 29 static files and 700 checked local links in run [#41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724).

Do not infer that a later run performed a browser test merely because the build workflow passed.

## Not currently automated

- Playwright or other browser E2E tests.
- Language switcher and translated-route tests.
- Admin UI, authentication or API tests.
- Media upload tests.
- Browser-level custom-domain smoke tests.
- Screen-reader testing or a formal accessibility audit.
- Full visual regression testing.

## Manual pre-release checklist

- [ ] Home page, all four collection indexes and representative detail pages load.
- [ ] Events page displays its honest empty state.
- [ ] About, Contact, Editorial Policy, Privacy and Accessibility pages load.
- [ ] 404 behavior is correct.
- [ ] Header and mobile navigation work with mouse, touch and keyboard.
- [ ] Focus indicators and skip link are visible and usable.
- [ ] Text remains readable at mobile widths and 200% zoom.
- [ ] Color contrast and headings are reviewed.
- [ ] Chinese characters display correctly.
- [ ] External sources and image rights are checked.
- [ ] No unexpected console errors, third-party trackers or network calls appear.
- [ ] Apex domain is active; \`www\` is tested after validation completes.
- [ ] Deployment commit SHA matches the intended \`main\` commit.

## Run locally

~~~bash
npm install
npm run build
npm run verify
npm run preview
~~~

See [development guide](development-guide.md) and [deployment guide](deployment-guide.md).
