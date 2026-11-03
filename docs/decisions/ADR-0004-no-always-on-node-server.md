# ADR-0004: No Always-On Node.js Server on Cloudflare Free

**Status:** Proposed · **Date:** 2026-11-04

## Context

The project owner wants to run the Chinese Culture website using Cloudflare's free “Node” computing/hosting offering. Cloudflare Workers supports JavaScript and a compatible subset of Node.js APIs, but it is not a normal persistent Node.js VPS. Each runtime invocation has Free-plan limits.

## Decision

Build the content-focused site with Astro and Node.js in a CI/build environment, publish prerendered output using **Cloudflare Workers Static Assets on the Workers Free plan**, and invoke Workers only for specifically approved future dynamic routes. Do not use a permanent Express/PM2 server or require SSR for regular pages.

## Reasons

- Static asset requests are free and unlimited.
- Purely static educational materials have no per-view backend compute requirement.
- Workers Free dynamic invocations are currently capped at 100,000/day, 10 ms CPU/request and other limits.
- Static-first deployment is easier to protect, review and maintain.

## Non-decisions

No framework dependency version is pinned. No Cloudflare account, deployment token, domain or CI workflow has yet been configured. No paid service is authorized by this ADR.

## Consequences

An editorial update triggers a build and deployment. Fully interactive forms, identity, native registrations and personalized progress must be designed separately; their cost/privacy model must be approved first. Some npm/Node.js libraries do not run inside Workers, even with compatibility enabled.

## Follow-up

Implement the validation gates in [the Cloudflare deployment plan](../architecture/06-cloudflare-free-node-deployment.md), inspect usage before launch, and recheck official Cloudflare policy/pricing at implementation.

## Source documentation

[Workers Static Assets pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Node compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
