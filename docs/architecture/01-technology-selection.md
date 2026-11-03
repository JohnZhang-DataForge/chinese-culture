# Technology Selection — Cloudflare Workers Free

**Status:** Proposed · **Last reviewed:** 2026-11-04

## Deployment requirement

This website must fit **Cloudflare Workers Free**, prioritizing **Workers Static Assets**. “Free Node.js” here means Node.js tooling at build time and optional Workers runtime compatibility; it does **not** provide a continuously running Node.js server.

## Stack

| Component | Decision | Why |
|---|---|---|
| Content framework | Astro, static prerendering | Fast content pages without server-side requests |
| Node.js | Build-time environment in development/CI | Build Markdown content into static HTML, CSS and JS |
| Production delivery | Cloudflare Workers Static Assets, Free plan | CDN-backed static asset requests free and unlimited |
| Production compute | No Worker script for core content pages | Keep dynamic Worker invocations at zero in MVP |
| Source and editorial workflow | Private GitHub, Markdown and pull requests | Auditable content approvals without database |
| Design | Responsive CSS and accessible HTML | Lightweight reading experience |
| Search | Navigation and static client-side index if needed | Avoid paid runtime API |
| Database / storage | None for MVP beyond compiled static assets | No need for D1/KV/R2 to serve content |
| APIs | Optional future Cloudflare Worker endpoints | Add only after approval of runtime, data and costs |

## Node.js compatibility

Cloudflare Workers supports a **subset** of Node.js APIs; some package shims are non-functional. A Worker with a compatibility date on or after **2026-08-04** enables Node compatibility by default; older compatibility dates may require `nodejs_compat`. Compatibility does not transform the Worker into an always-on Node.js VM. Validate third-party dependencies before selecting them.

## Critical Astro caveat

Astro prerenders static pages by default. Adding Astro's Cloudflare adapter can change output to server rendering: pages not explicitly prerendered would invoke a Worker. **Do not add a server adapter for MVP.** Deploy the static build output as assets.

## Free limits to respect

Worker Free scripts: **100,000 requests/day**, **10 ms CPU per HTTP request**, **128 MB memory** and **50 subrequests per request**; asset limit **20,000 files per Worker version** and **25 MiB per file**. Static asset requests themselves are free and unlimited. See [the detailed deployment plan](06-cloudflare-free-node-deployment.md) for policies, tradeoffs and validation.

## Deferred alternatives

Managed databases, CMS backends, always-on Node/Express services, SSR for article pages, dynamic personalization, accounts and paid add-ons require a new ADR and usage budget.

## Sources

[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) · [Static Assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Node.js APIs](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) · [Astro guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
