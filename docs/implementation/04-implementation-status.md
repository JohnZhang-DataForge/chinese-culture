# Implementation Status and Known Gaps

**Updated:** 2026-11-04  
**Stage:** MVP source merged to GitHub main through [PR #1](https://github.com/JohnZhang-DataForge/chinese-culture/pull/1) after green CI. Embedded Worker fallback is now part of the build; public deployment and editorial launch review are the remaining gates.  
**Hosting:** Cloudflare Workers Free. Preferred native Static Assets config remains available; an embedded-script fallback is provided for the initial deployment. Worker fallback is subject to 100,000 requests/day across the account.
**Merged commit:** [778b5ea](https://github.com/JohnZhang-DataForge/chinese-culture/commit/778b5ea54ee9aec6120524f25aa119c5107191c9).

## Implemented in source

| Area | Source status | Notes |
|---|---|---|
| Astro static project | Added | Node build time, no adapter/SSR |
| Cloudflare static-assets config | Added | Preferred path: `dist/`, custom 404 handling, no Worker entrypoint |
| Embedded Worker fallback | Added | Gzip-compressed static build, GET/HEAD routing, 404 and security headers |
| Worker fallback tests | Added | Node runtime smoke checks for home, content, CSS, 404, HEAD and method rejection |
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
| Public hosting | Deployment in progress | Requires live URL and browser-level smoke verification |

## Validation state

Source files are committed to a feature branch. The project must pass real dependency installation, Astro static generation and `npm run verify` on GitHub CI before merge. This document should be updated with an actual PR/run reference after validation. A code commit alone is not proof that a build passed.

## Remaining before public launch

- Keep CI passing after any change; verify all internal links in build output.
- Publish one-day GitHub Actions artifacts for the static build and fallback Worker bundle.
- Record dependency lockfile/reproducible installs after the initial build.
- Test keyboard navigation, screen reader, responsive layouts and contrast in a browser.
- Assign factual/editorial reviewers and check all source links and Chinese terms.
- Replace pending public contact details with a verified method and approve privacy notice.
- Add only real, source-verified events, or keep the empty state.
- Establish Cloudflare Workers Free account and deploy through the embedded fallback or native Static Assets path without committing secrets.
- Preview, validate domain/HTTPS, verify page routes and response headers, and sign off production launch.

## Explicit exclusions

No live API, user accounts, SSR, always-on Node.js VPS, Worker script invocation on educational pages, database, newsletter, payment/registration processing or third-party analytics.

## References

[Repository map](../architecture/07-implemented-repository-map.md) · [Runbook](05-developer-runbook.md) · [Release log](../operations/03-change-log.md) · [Launch checklist](03-launch-checklist.md).
