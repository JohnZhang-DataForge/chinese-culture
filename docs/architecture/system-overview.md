# System Overview

**Status:** Implemented baseline, with localization and CMS work not yet present in the inspected source.  
**Verified against:** \`main\` at \`539b37c9bfa5363f7149c95563bd549957eeff3d\` (2026-11-05).

## What exists today

Chinese Culture Atlas is an English-language, statically generated educational website. Astro 5 reads Markdown content from the private GitHub repository and generates static HTML into \`dist/\`. GitHub Actions validates the build and uses Wrangler Direct Upload to publish it to Cloudflare Pages Free.

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
  K[chinese-culture.site DNS] --> I
  L[www to apex 301 rule] --> K
~~~

## Components and responsibilities

| Component | Current responsibility |
|---|---|
| Astro 5 | Build-time page generation; \`output: "static"\` |
| Markdown collections | Lessons, culture articles, festivals and books |
| GitHub | Private source of truth, review history and release source |
| GitHub Actions | Pull-request CI and main-branch deployment |
| Wrangler | Uploads the prebuilt \`dist/\` directory to Pages |
| Cloudflare Pages | Serves static site assets |
| Cloudflare DNS and Rules | Resolves the custom hostnames and redirects \`www\` to the apex |

The public site currently has no database, server-side rendering, Pages Functions, runtime API, user accounts, admin dashboard, newsletter, contact form or dynamic event service.

## Current public routes

- \`/\` — homepage
- \`/learn/\`, \`/culture/\`, \`/festivals/\`, \`/books/\` — collection indexes and generated detail pages
- \`/events/\` — static empty state; no event collection exists
- \`/about/\`, \`/contact/\`, \`/editorial-policy/\`, \`/privacy/\`, \`/accessibility/\`, \`/404\`

All current public pages use English route names and the shared layout emits \`<html lang="en">\`. Chinese characters may appear as terms within English content; that is not a Chinese-language site.

## Deployment evidence

- GitHub Pages deployment workflow run: [#41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872), completed successfully.
- CI run: [#41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795), completed successfully.
- Cloudflare production deployment: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Deployed source commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Pages project: \`chinese-culture\`; \`uses_functions=false\`.
- The apex custom domain is active. The \`www\` custom-domain validation was still pending at the latest individual domain read.

A successful Actions run and Pages deployment record establish deployment success; they do not substitute for browser-based accessibility, functional or domain smoke tests.

## Planned capabilities are not current components

Bilingual routes, translation relationships, browser-based CMS, Cloudflare Access/JWT authentication, GitHub API write operations and media upload are not present in the inspected \`main\` source. They must be documented as implemented only after their code, configuration and verification are merged. Agent 0's \`docs/openspec/\` contracts were not present on this inspected \`main\`; this document does not define or replace those contracts.

## Source of truth

- Application and editorial source: this private repository.
- Build output: generated \`dist/\`; it is not the editable content source.
- Hosting and DNS state: Cloudflare account configuration.
- Current operational snapshot: [implementation status](../implementation/implementation-status.md) and [Cloudflare configuration](../operations/cloudflare-configuration.md).
