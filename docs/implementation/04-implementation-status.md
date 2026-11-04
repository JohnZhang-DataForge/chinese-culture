# Implementation Status and Known Gaps

**Updated:** 2026-11-04  
**Stage:** MVP source merged to `main`; Cloudflare Pages Direct Upload project is provisioned; first production deployment awaits a one-time dashboard upload or protected API token.  
**Hosting:** Cloudflare Pages Free Direct Upload. Project `chinese-culture` is created at [chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev); no production deployment has yet been published.  
**Latest main:** [791b1dc](https://github.com/JohnZhang-DataForge/chinese-culture/commit/791b1dc9e40888c6cfd312b3e95cec02f559b0ec).

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

[GitHub Actions run #41829390039](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41829390039) passed on `main`: dependency install, Astro build, static verifier and deployment-artifact packaging all succeeded. The build generated 25 pages, 29 files and passed the 700-link check. This is build verification, not proof of a live Pages deployment.

## Remaining before public launch

- Keep CI passing after any change; verify all internal links in build output.
- Keep build CI green and refresh the one-day `chinese-culture-dist` artifact on main pushes.
- Record dependency lockfile/reproducible installs after the initial build.
- Test keyboard navigation, screen reader, responsive layouts and contrast in a browser.
- Assign factual/editorial reviewers and check all source links and Chinese terms.
- Replace pending public contact details with a verified method and approve privacy notice.
- Add only real, source-verified events, or keep the empty state.
- For immediate launch, upload the verified `chinese-culture-dist` ZIP through the Pages dashboard; for repeatable releases, add a least-privilege Pages API token and account ID to GitHub Actions secrets. Never commit credentials.
- Complete the first Pages Direct Upload, validate `chinese-culture-79h.pages.dev`, HTTPS, page routes and response headers, then sign off production launch.

## Explicit exclusions

No live API, user accounts, SSR, always-on Node.js VPS, Worker script invocation on educational pages, database, newsletter, payment/registration processing or third-party analytics.

## References

[Repository map](../architecture/07-implemented-repository-map.md) · [Runbook](05-developer-runbook.md) · [Release log](../operations/03-change-log.md) · [Launch checklist](03-launch-checklist.md).
