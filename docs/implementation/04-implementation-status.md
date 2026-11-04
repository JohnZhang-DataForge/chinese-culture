# Implementation Status and Known Gaps

**Updated:** 2026-11-04  
**Stage:** MVP source merged to GitHub main through [PR #1](https://github.com/JohnZhang-DataForge/chinese-culture/pull/1) after green CI. Cloudflare Pages Direct Upload project is provisioned; first production deployment awaits the protected API token.  
**Hosting:** Cloudflare Pages Free Direct Upload. Project `chinese-culture` is created at `chinese-culture-79h.pages.dev`; no production deployment has yet been published.
**Merged commit:** [778b5ea](https://github.com/JohnZhang-DataForge/chinese-culture/commit/778b5ea54ee9aec6120524f25aa119c5107191c9).

## Implemented in source

| Area | Source status | Notes |
|---|---|---|
| Astro static project | Added | Node build time, no adapter/SSR |
| Cloudflare Pages config | Added | `pages_build_output_dir: ./dist`; no Functions or SSR |
| Pages Direct Upload project | Provisioned | `chinese-culture`, production branch `main`; first upload pending token |
| Shared layout and navigation | Added | Desktop and mobile using native HTML details |
| Landing page | Added | Curated starter learning, articles and festivals |
| Collection index and detail routes | Added | Generated from Markdown during build |
| Beginner curriculum | 5 lessons drafted | Additional teaching review needed |
| Culture articles | 3 drafted | Includes credible further-reading links |
| Festival references | 3 drafted | Evergreen, not real-world event registration |
| Book guides | 2 drafted | Original guidance, no hosted copyrighted book text |
| Events | Placeholder with honest empty state | No verified current event information |
| Informational pages | Added | About, contact-status, privacy, accessibility, editorial policy |
| Responsive styles | Added | Mobile layout, focus, reduced motion |
| Build CI | Added | GitHub Actions install/build/static verifier |
| Public hosting | Project provisioned; deployment pending | Requires GitHub API token secret, first Pages deployment and browser smoke verification |

## Validation state

Source files are committed to a feature branch. The project must pass real dependency installation, Astro static generation and `npm run verify` on GitHub CI before merge. This document should be updated with an actual PR/run reference after validation. A code commit alone is not proof that a build passed.

## Remaining before public launch

- Keep CI passing after any change; verify all internal links in build output.
- Keep the build-only CI green and publish the one-day static build artifact.
- Record dependency lockfile/reproducible installs after the initial build.
- Test keyboard navigation, screen reader, responsive layouts and contrast in a browser.
- Assign factual/editorial reviewers and check all source links and Chinese terms.
- Replace pending public contact details with a verified method and approve privacy notice.
- Add only real, source-verified events, or keep the empty state.
- Add a least-privilege Cloudflare Pages API token and account ID to GitHub Actions secrets; never commit credentials.
- Trigger Pages Direct Upload, validate `chinese-culture-79h.pages.dev`, HTTPS, page routes and response headers, then sign off production launch.

## Explicit exclusions

No live API, user accounts, SSR, always-on Node.js VPS, Worker script invocation on educational pages, database, newsletter, payment/registration processing or third-party analytics.

## References

[Repository map](../architecture/07-implemented-repository-map.md) · [Runbook](05-developer-runbook.md) · [Release log](../operations/03-change-log.md) · [Launch checklist](03-launch-checklist.md).
