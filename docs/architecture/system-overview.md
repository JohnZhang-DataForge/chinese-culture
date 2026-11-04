# System Overview

**Current implementation:** English-only static Astro site on Cloudflare Pages.  
**Source snapshot:** \`main\` at \`539b37c9bfa5363f7149c95563bd549957eeff3d\` (2026-11-05).  
**Future architecture:** Agent 0 OpenSpec PR #3 — Proposed, not yet Ready or merged.

## What exists today

Astro 5 reads Markdown content from the private GitHub repository and generates static HTML into \`dist/\`. GitHub Actions validates the build and uses Wrangler Direct Upload to publish it to Cloudflare Pages Free.

~~~mermaid
flowchart TD
  A[Owner and contributors] --> B[Private GitHub repository]
  B --> C[Pull request and review]
  C --> D[main]
  D --> E[GitHub Actions: Node.js 22]
  E --> F[Astro build and static verification]
  F --> G[dist static files]
  G --> H[Wrangler Direct Upload]
  H --> I[Cloudflare Pages Free]
  I --> J[Readers]
  K[Cloudflare DNS] --> I
~~~

## Current components

| Component | Current responsibility |
|---|---|
| Astro 5 | Build-time page generation; \`output: "static"\` |
| Markdown collections | Lessons, culture articles, festivals and books |
| GitHub | Private source of truth, review history and release source |
| GitHub Actions | Pull-request CI and main-branch deployment |
| Wrangler | Uploads the prebuilt \`dist/\` directory to Pages |
| Cloudflare Pages | Serves static site assets |
| Cloudflare DNS and Rules | Resolves apex and \`www\`; canonical redirects |

The public site currently has no production CMS, Admin API, user accounts, database, Pages Functions, separate Admin Worker or runtime event service in the inspected \`main\` source.

## Current public routes

- \`/\` — English homepage
- \`/learn/\`, \`/culture/\`, \`/festivals/\`, \`/books/\` — collection indexes and generated detail pages
- \`/events/\` — static empty state; no event collection exists
- \`/about/\`, \`/contact/\`, \`/editorial-policy/\`, \`/privacy/\`, \`/accessibility/\`, \`/404\`

All current pages use English routes and the shared layout emits \`<html lang="en">\`. Chinese characters may appear as terms within English content; that is not a Chinese-language site.

## Verified production state

- GitHub Pages deployment run [#41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872): success.
- Static CI run [#41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795): success.
- Cloudflare production deployment: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Deployed source commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Pages project: \`chinese-culture\`; \`uses_functions=false\`.
- Apex and \`www\` Pages custom-domain APIs now report both domains active, with HTTP validation active.
- Cloudflare configuration is verified; external HTTP/TLS smoke tests remain unverified from the current execution environment.

## Proposed target architecture — not yet frozen

Agent 0's open PR #3 proposes:
- Public static Astro pages with \`/en/\` and \`/zh-cn/\` locale prefixes.
- A static Admin UI under \`/admin/*\`, protected by Cloudflare Access.
- A **separately deployed Cloudflare Worker** serving \`/api/admin/v1/*\`.
- Worker-side Access JWT verification, role checks, CSRF/origin validation and GitHub App token exchange.
- Git-backed content/media branches and PR-based publication.
- Human-reviewed merges to \`main\`, followed by the existing Pages deployment.

The contract PR is marked Proposed and explicitly says it is not Ready until merged and announced by Agent 0. Do not treat the target topology as deployed.

## Cross-agent integration risks observed

At this snapshot:
- Agent 5's backend branch contains Cloudflare Pages Functions under \`functions/\`, which conflicts with Agent 0's proposed separate Worker architecture. Resolve this before backend integration.
- Agent 6's conditional localization tests currently refer to \`/zh/\`, while Agent 0's proposed route segment is \`/zh-cn/\`. Align the tests before enabling the release gate.
- Agent 4's admin frontend PR is draft and uses development-only mock records; its PR states real API integration is pending Agent 0/5 contracts.

## Source of truth

- Current public source: this private repository's \`main\`.
- Future shared interfaces: Agent 0's \`docs/openspec/\` after merge and Ready announcement.
- Build output: generated \`dist/\`; not the editable content source.
- Hosting and DNS state: Cloudflare account configuration.

See [implementation status](../implementation/implementation-status.md), [Cloudflare Pages architecture](cloudflare-pages-architecture.md) and [Cloudflare configuration](../operations/cloudflare-configuration.md).
