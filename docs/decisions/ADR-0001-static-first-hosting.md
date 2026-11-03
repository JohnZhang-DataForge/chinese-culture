# ADR-0001: Cloudflare Workers Free, Static-first Hosting

**Status:** Proposed · **Updated:** 2026-11-04

## Context

The Chinese Culture website primarily offers lessons, articles, books, festivals and curated event information. The owner wants hosting using **Cloudflare's free Node.js-compatible offering** and minimal running costs.

## Decision

Use **Astro static prerendering** with Node.js in development/CI, then publish output to **Cloudflare Workers Static Assets (Workers Free)**. Ordinary content pages must not require Cloudflare Worker script invocations. Do not deploy a permanently running Node.js/Express server, SSR-first app, CMS database or paid add-on for MVP.

## Cloudflare runtime interpretation

Cloudflare Workers supports JavaScript and a subset of Node.js APIs, but it is an event-driven runtime and not a free Node.js VPS. The distinction is detailed in [ADR-0004](ADR-0004-no-always-on-node-server.md) and [the hosting plan](../architecture/06-cloudflare-free-node-deployment.md).

## Advantages

- Free and unlimited normal static asset requests under current Cloudflare pricing.
- No per-reader application compute for educational pages.
- Low deployment overhead and no runtime database.
- Source and publishing decisions remain reviewable in GitHub.

## Tradeoffs

- Editors publish through PR/build/release rather than an on-site CMS.
- Dynamic API routes, authentication, SSR and personalized learning require later design, monitoring and budget review.
- Free Worker script quotas are not unlimited: currently 100,000/day and 10 ms CPU/request, alongside other limits.
- Custom domain registration may incur cost even if the hosting plan remains free.

## Alternatives

Workers runtime SSR for every page: not selected due to CPU/request budget. Traditional Node.js server/VPS: not available as a standard Workers Free service. Database-backed CMS: unnecessary at MVP. Cloudflare Pages static hosting: a possible implementation-time fallback, but Workers Static Assets is the documented primary target.

## Review triggers

Any required dynamic feature, a constraint that makes pure static serving impractical, material Cloudflare pricing/limit changes or an editorial workflow need that Git-first publishing cannot satisfy.

## Official references

[Static Assets](https://developers.cloudflare.com/workers/static-assets/) · [Billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
