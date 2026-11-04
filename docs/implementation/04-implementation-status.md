# Implementation Status and Known Gaps

**Updated:** 2026-11-04  
**Stage:** MVP source merged to GitHub main through [PR #1](https://github.com/JohnZhang-DataForge/chinese-culture/pull/1) after green CI. Production deployment and editorial launch review pending.  
**Hosting:** Cloudflare Workers Free is the documented deployment target; **no public deployment confirmed**.
**Merged commit:** [778b5ea](https://github.com/JohnZhang-DataForge/chinese-culture/commit/778b5ea54ee9aec6120524f25aa119c5107191c9).

## Implemented in source

| Area | Source status | Notes |
|---|---|---|
| Astro static project | Added | Node build time, no adapter/SSR |
| Cloudflare static-assets config | Added | `dist/`, custom 404 handling, no Worker entrypoint |
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
| Public hosting | **Not done** | Needs Cloudflare account access and validation |

## Validation state

Source files are committed to a feature branch. The project must pass real dependency installation, Astro static generation and `npm run verify` on GitHub CI before merge. This document should be updated with an actual PR/run reference after validation. A code commit alone is not proof that a build passed.

## Remaining before public launch

- Keep CI passing after any change; verify all internal links in build output.
- Publish a one-day GitHub Actions build artifact from main for the Cloudflare deployment step.
- Record dependency lockfile/reproducible installs after the initial build.
- Test keyboard navigation, screen reader, responsive layouts and contrast in a browser.
- Assign factual/editorial reviewers and check all source links and Chinese terms.
- Replace pending public contact details with a verified method and approve privacy notice.
- Add only real, source-verified events, or keep the empty state.
- Establish Cloudflare Workers Free account and deployment credentials without committing secrets.
- Preview, validate domain/HTTPS, verify static asset requests, and sign off production launch.

## Explicit exclusions

No live API, user accounts, SSR, always-on Node.js VPS, Worker script invocation on educational pages, database, newsletter, payment/registration processing or third-party analytics.

## References

[Repository map](../architecture/07-implemented-repository-map.md) · [Runbook](05-developer-runbook.md) · [Release log](../operations/03-change-log.md) · [Launch checklist](03-launch-checklist.md).
