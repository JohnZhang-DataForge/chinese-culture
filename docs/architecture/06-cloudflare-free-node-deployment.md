# Cloudflare Pages Free Static Hosting Plan

**Status:** Architecture accepted for MVP · **Target:** Cloudflare Pages Free Direct Upload · **Implementation:** Astro source, Pages project and Wrangler deployment workflow configured; first deployment awaits protected credentials.

## What “Cloudflare free Node” means

Cloudflare Pages is a **static hosting and deployment platform**, not a free traditional Linux virtual machine. Node.js is used by GitHub Actions to build the website; no Node.js process runs after deployment. Pages Functions can add event-driven server-side code later, but are deliberately excluded from the MVP.

**Node.js is used for website builds** in a development machine or CI runner. The output is static HTML, CSS, JavaScript and media delivered by Cloudflare. No visitor request executes Worker code in the MVP.

## Approved deployment target

```text
Authors → private GitHub repository → pull request + editorial review
        → Node.js/Astro build in CI → generated static files
        → Cloudflare Workers Static Assets (Workers Free)
        → visitors around the world

Optional later: /api/* → Cloudflare Worker (Node.js-compatible APIs only)
```

The GitHub repo remains private even though the deployed website is public. Avoid copying private documentation into public assets.

## Framework and runtime boundaries

- **Astro static output:** generate every normal page at build time. Do not enable SSR/Cloudflare adapter for MVP; Astro's Cloudflare adapter can switch rendering to on-demand server output, which invokes Workers and consumes dynamic quota.
- **Build environment:** use an actively supported Node.js version compatible with the selected Astro version; pin it only when implementing. The Node.js process runs at build/deployment time, not as a permanent Cloudflare server.
- **Cloudflare Static Assets:** serve HTML/CSS/JS/images as assets; no Worker execution on normal content routes.
- **Dynamic endpoints:** require a new decision and explicit Worker route, cost, CPU, data retention and privacy review.
- **Node API compatibility:** for Workers compatibility dates **2026-08-04 or later**, Node.js compatibility is enabled by default. Older dates may require `nodejs_compat`. Do not add redundant flags to a new project using a recent compatibility date. Validate actual package/runtime support before coding.
- **No persistent backend:** no Express/Next custom Node server, always-on process, WebSocket server dependency or filesystem-based mutable data for MVP.

## Free-tier budget — official baseline checked November 2026

| Resource | Workers Free baseline | Website design response |
|---|---|---|
| Static asset requests | Free and unlimited when no Functions run | Keep all normal pages prerendered |
| Builds | 500/month, one concurrent build | CI runs only on changes and manual release |
| Files per site | 20,000 | Current output has 29 files |
| Individual static asset | 25 MiB | Optimize images and keep files below the limit |
| Custom domains | Up to 100 per project on Free | Use the free `pages.dev` hostname initially |
| Pages Functions | Consume Workers Free quota | No Functions in MVP |

The 100,000/day Workers Free quota applies only if Pages Functions are invoked; ordinary static asset requests remain free and unlimited. Never add Functions or paid services without owner approval.

Limits, billing and supported features change. Revalidate official docs immediately before deployment.

## Practical cost-minimizing rules

1. **All article, lesson, festival, book and event pages are static.**
2. Event schedules are maintained in Git and rebuilt on publication, not fetched at every visit.
3. Search starts with structured navigation or an offline-generated browser index, not a hosted search API.
4. Images are compressed, attributed, sized for the web and hosted as static assets within limits.
5. Avoid D1, KV, R2, Durable Objects, paid analytics, background jobs and third-party AI APIs unless a later ADR justifies them.
6. Newsletter, forms, accounts, submissions and login features are deferred.
7. Use GitHub PRs for editorial review, CI for reproducible builds, and a protected deployment credential for production.
8. Configure usage monitoring and a clear failure/fallback plan before adding dynamic requests.

## Implementation state and release sequence

1. A Cloudflare Pages Direct Upload project named `chinese-culture` has been created; its current free hostname is `chinese-culture-79h.pages.dev`.
2. Astro source is now created at the repository root with static rendering; maintain this output mode.
3. Markdown collections now contain lessons, articles, festivals and book guides. Events are not populated without verification.
4. Run Node.js builds in CI, validate static routes and resolve reported failures; initial code is not proof of a passing build.
5. Configure Wrangler Direct Upload with a least-privilege Cloudflare Pages API token stored in GitHub Actions secrets.
6. Publish to Pages production; test all routes, HTTPS, images and 404 behavior.
7. Confirm the project contains no Pages Functions and review the Pages build/file limits.
8. Approve public release and document rollback and domain ownership.
9. Add a Worker API only if a new user requirement is accepted and it fits Free quotas.

## Architecture acceptance tests

- All MVP pages are served as static assets.
- No Node.js server or background process required after deployment.
- No database or paid Cloudflare resource provisioned.
- Public website does not expose private GitHub files, review notes or credentials.
- Manual and automated links work across major sections, including festival/event pages.
- Mobile, accessibility, SEO, HTTPS and event-expiration checks pass.
- Free-tier usage and operational ownership are documented.

## References (official)

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages Free limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Node.js runtime compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Astro on Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Related current implementation

[Repository map](07-implemented-repository-map.md) · [Developer runbook](../implementation/05-developer-runbook.md) · [Implementation status](../implementation/04-implementation-status.md).
