# Test Strategy and Quality Gates

**Status:** GitHub Actions build and extended internal-link checks PASS; full browser testing pending.

## Automated checks

The GitHub Actions workflow `.github/workflows/site-ci.yml` runs:

1. Install npm dependencies in Node.js 22.
2. `npm run build` (Astro static output).
3. `npm run verify` (Node static-output guardrails).

The verifier asserts:
- `dist/` exists and key public routes have generated HTML.
- No `dist/_worker.js` exists (unexpected SSR output).
- Wrangler has the correct `./dist` asset directory and no Worker `main` script.
- Build includes at most 20,000 files, each at most 25 MiB, within current Free static asset limits.
- Every local href found in generated HTML points to an existing static file/route; at least 13 guide pages exist.
- The homepage has expected project branding.

**Evidence:** Initial [GitHub Actions run #41717562416](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41717562416) succeeded (25 pages built; 29 static files; no SSR). **Latest verified [run #41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724): 25 static pages, 13 article/lesson guides, 29 static files, 700 local links validated, no SSR Worker.** A prior intermediate run #41717877814 caught a syntax error in the newly added test and was superseded by the corrected passing run.

## Manual testing before release

- Home, indexes, articles and legal/information pages on small and wide screens.
- Native mobile menu: click/touch, keyboard, focus order, Escape handling where appropriate.
- Layout at 200% zoom; no horizontal scroll blocking content.
- Screen reader headings, navigation landmarks and links.
- Mixed English and Chinese character display and legibility.
- External educational links and factual/rights review.
- Empty Events state, missing-route/404, privacy disclosure and no tracking requests.
- Browser console and network inspection for unexpected script calls or external assets.
- Preview over HTTPS and Cloudflare Workers Free usage.

## Security & runtime gates

No secrets in Git, no forced paid services, no SSR or database. Check actual Cloudflare deployment asset behavior instead of inferring it from config alone.

## Exit criteria

The project may be **merged** only after CI passes and code review is complete. It may be **publicly launched** only after content/rights review, browser/a11y tests, account authorization and production verification.
