# Cloudflare Pages Free Static Hosting Plan

**Status:** Accepted for MVP · **Target:** Cloudflare Pages Free Direct Upload · **Implementation:** Astro source, Pages project and credential-gated Wrangler deployment workflow configured; first production deployment pending.

## What “Cloudflare free Node” means

Cloudflare Pages is a **static hosting and deployment platform**, not a free traditional Linux virtual machine. Node.js runs in GitHub Actions to build the website; no Node.js process runs after deployment. Pages Functions can add event-driven server-side code later, but they are deliberately excluded from the MVP.

**Node.js is used for website builds** in a development machine or CI runner. The output is static HTML, CSS, JavaScript and media delivered by Cloudflare. No visitor request executes Worker code in the MVP.

## Approved deployment target

```text
Authors → private GitHub repository → pull request + editorial review
        → GitHub Actions (Node.js/Astro build + verification)
        → dist/ static HTML, CSS and public assets
        → Wrangler Direct Upload → Cloudflare Pages Free
        → visitors around the world

Optional later: Pages Functions only after a separate cost/privacy review
```

The GitHub repo remains private even though the deployed website is public. Avoid copying private documentation into public assets.

## Framework and runtime boundaries

- **Astro static output:** generate every normal page at build time. Do not enable SSR or a Cloudflare adapter for MVP.
- **Build environment:** Node.js 22 runs in GitHub Actions or on a developer machine, not as a permanent Cloudflare server.
- **Cloudflare Pages:** serves HTML/CSS/JS/images as static assets. No Functions are present in the MVP.
- **Dynamic endpoints:** require a new decision and explicit cost, CPU, data-retention and privacy review.
- **No persistent backend:** no Express/Next custom Node server, always-on process, WebSocket server, database or filesystem-based mutable data.

## Free-tier budget — official baseline checked November 2026

| Resource | Pages Free baseline | Website design response |
|---|---:|---|
| Static asset requests | Free and unlimited when no Functions run | Keep all normal pages prerendered |
| Builds | 500/month, one concurrent build | CI runs on source changes; manual release is available |
| Files per site | 20,000 | Current output has 29 files |
| Individual static asset | 25 MiB | Optimize images and keep files below the limit |
| Custom domains | Up to 100 per project | Use the free `pages.dev` hostname initially |
| Pages Functions | Consume Workers Free quota | No Functions in MVP |

The 100,000/day Workers Free quota applies only if Pages Functions are invoked; ordinary static asset requests remain free and unlimited. Never add Functions or paid services without owner approval.

Limits, billing and supported features change. Revalidate official docs before adding features.

## Practical cost-minimizing rules

1. **All article, lesson, festival, book and event pages are static.**
2. Event schedules are maintained in Git and rebuilt on publication, not fetched at every visit.
3. Search starts with structured navigation or an offline-generated browser index, not a hosted search API.
4. Images are compressed, attributed, sized for the web and hosted as static assets within limits.
5. Avoid D1, KV, R2, Durable Objects, paid analytics, background jobs and third-party AI APIs unless a later ADR justifies them.
6. Newsletter, forms, accounts, submissions and login features are deferred.
7. Use GitHub PRs for editorial review, CI for reproducible builds and a protected deployment credential for production.
8. Keep the public build limited to generated website assets; private plans and documentation must never be uploaded.

## Implementation state and release sequence

1. The Cloudflare Pages Direct Upload project `chinese-culture` exists at `chinese-culture-79h.pages.dev`.
2. Astro source is implemented with static rendering; maintain this output mode.
3. Markdown collections contain lessons, articles, festivals and book guides. Events remain an honest empty state until real listings are verified.
4. GitHub Actions installs dependencies, builds Astro, verifies the output and packages a short-lived deployment artifact.
5. The first deployment can be made by uploading that ZIP through the Pages dashboard, or by adding a least-privilege Pages API token to GitHub Actions and using Wrangler Direct Upload.
6. Test all routes, HTTPS, images, 404 behavior and response headers after deployment.
7. Confirm no Pages Functions are deployed and review Pages build/file limits.
8. Approve public release and document rollback and domain ownership.

## Architecture acceptance tests

- All MVP pages are served as static assets.
- No Node.js server or background process is required after deployment.
- No database, Pages Function or paid Cloudflare resource is provisioned.
- Public website does not expose private GitHub files, review notes or credentials.
- Internal links work across major sections, including festival/event pages.
- Mobile, accessibility, SEO, HTTPS and event-expiration checks pass.
- Free-tier usage and operational ownership are documented.

## References (official)

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages Free limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Astro on Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)

## Related current implementation

[Repository map](07-implemented-repository-map.md) · [Developer runbook](../implementation/05-developer-runbook.md) · [Implementation status](../implementation/04-implementation-status.md).
