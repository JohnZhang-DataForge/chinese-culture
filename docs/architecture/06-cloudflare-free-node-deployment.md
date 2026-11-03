# Cloudflare Free Node.js-Compatible Deployment Plan

**Status:** Architecture accepted for MVP · **Target:** Cloudflare Workers Free with Static Assets · **Implementation:** Astro source and Wrangler configuration added; deployment still pending.

## What “Cloudflare free Node” means

Cloudflare Workers is a **request/event-driven edge JavaScript runtime**, not a free traditional Linux virtual machine. It supports many Node.js APIs but is **not** a continuously running Node.js VPS for an Express app, PM2 process, cron daemon or arbitrary listening server. Some Node.js APIs are partial or non-functional shims, so the compatibility of packages must be checked individually.

**Node.js is used for website builds** in a development machine or CI runner. The output is static HTML, CSS, JavaScript and media delivered by Cloudflare. Only future approved dynamic routes execute Worker code.

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
| Static asset requests | Free and unlimited | Make educational pages prerendered assets |
| Dynamic Worker requests | 100,000/day account-level | Aim for zero dynamic requests in MVP |
| Worker CPU | 10 ms / HTTP request | Do not perform heavy SSR or processing |
| Worker memory | 128 MB | Avoid memory-heavy runtime dependencies |
| Subrequests | 50 per Worker request | Avoid chains of remote API calls |
| Static files per version | 20,000 | Monitor content/media file count |
| Individual static asset | 25 MiB | Optimize images; host larger media elsewhere if approved |
| Worker scripts | Account limit and bundle caps apply | Keep MVP assets-first; check latest limits |
| Custom domain | Domain registration may cost extra | Use a free `workers.dev` hostname initially if acceptable |

The 100,000/day quota applies to Worker script invocations, not ordinary static asset requests. If dynamic routes exceed free quotas, users can receive errors. Never assume paid services activate without owner approval.

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

1. Create/verify a Workers Free account and an available `workers.dev` site name; decide on an optional custom domain separately.
2. Astro source is now created at the repository root with static rendering; maintain this output mode.
3. Markdown collections now contain lessons, articles, festivals and book guides. Events are not populated without verification.
4. Run Node.js builds in CI, validate static routes and resolve reported failures; initial code is not proof of a passing build.
5. Configure Cloudflare Static Assets deployment with restricted GitHub/Cloudflare access.
6. Publish to a preview environment; test all routes, HTTPS, images and 404 behavior.
7. Check that ordinary visits do not execute Worker code; check analytics and account usage limits.
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

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Free platform limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Node.js runtime compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Astro on Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Related current implementation

[Repository map](07-implemented-repository-map.md) · [Developer runbook](../implementation/05-developer-runbook.md) · [Implementation status](../implementation/04-implementation-status.md).
