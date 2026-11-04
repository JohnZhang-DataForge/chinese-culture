# Implementation Status and Known Gaps

**Updated:** 2026-11-05  
**Stage:** MVP source merged to `main`; Cloudflare Pages Free Direct Upload project is provisioned; first production deployment awaits one protected API token.  
**Hosting:** Cloudflare Pages Free Direct Upload. Project `chinese-culture` is created at [chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev); no production deployment has yet been published.  
**Main branch:** [main](https://github.com/JohnZhang-DataForge/chinese-culture/tree/main).

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
| Pages deployment workflow | Added | Wrangler Direct Upload; requires one protected Pages Write token |
| Public hosting | Project provisioned; deployment pending | Requires token secret, first deployment and browser smoke verification |

## Validation state

The latest successful main-branch CI run [#41922502515](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41922502515) passed: dependency install, Astro build, static verifier and deployment-artifact packaging. The build generated 25 pages, 29 files and passed the 700-link check. This is build verification, not proof of a live Pages deployment.

## Deployment state (2026-11-05)

- Cloudflare account connection is working; account ID is configured in the deployment workflow.
- Pages project `chinese-culture` exists at [chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev), but its deployments list is empty and its latest/canonical deployment is null.
- The GitHub Pages Git integration had an account-side installation error. This does not block Direct Upload; the project is intentionally deployed by GitHub Actions and Wrangler rather than Cloudflare's Git integration.
- The deployment workflow is gated: push-triggered deployments remain skipped until repository variable `CLOUDFLARE_DEPLOY_ENABLED=true`; manual `workflow_dispatch` is available after the token secret is added.
- The connected Cloudflare API can inspect the Pages project and issue an upload token, but direct asset upload requires a short-lived JWT in a custom Authorization header. That upload step cannot be completed through the current API connector. The GitHub Actions Wrangler workflow is the supported release path.
- Exact token setup and release steps are documented in [Cloudflare deployment status](../operations/04-cloudflare-deployment.md).

## Remaining before public launch

- Add GitHub repository secret `CLOUDFLARE_API_TOKEN` with the Cloudflare **Pages Write** role, scoped to the intended account only.
- Run **Actions → Deploy Chinese Culture Atlas to Cloudflare Pages → Run workflow** on `main`.
- Verify the production deployment, home page, nested article routes, 404 behavior, HTTPS and response headers.
- Keep CI passing after any change; verify all internal links in build output.
- Commit a lockfile and convert CI installs to `npm ci` for stronger reproducibility.
- Test keyboard navigation, screen reader, responsive layouts and contrast in a browser.
- Assign factual/editorial reviewers and check all source links and Chinese terms.
- Replace pending public contact details with a verified method and approve privacy notice.
- Add only real, source-verified events, or keep the empty state.
- Record deployment ID, source SHA, timestamp and rollback target after first publication.

## Explicit exclusions

No live API, user accounts, SSR, always-on Node.js VPS, database, newsletter, payment/registration processing or third-party analytics.

## References

[Repository map](../architecture/07-implemented-repository-map.md) · [Runbook](05-developer-runbook.md) · [Release log](../operations/03-change-log.md) · [Launch checklist](03-launch-checklist.md).
