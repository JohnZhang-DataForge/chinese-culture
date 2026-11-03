# Implementation Plan — Ordered Phases

**Status:** Active plan. Phase 1 source work has begun. See [implementation status](04-implementation-status.md) for confirmed outcomes; nothing is publicly deployed.

## Phase 0 — Discovery and approval (baseline selected, some ownership decisions pending)

- Agree audience, site purpose, content boundaries and launch priorities.
- Review sitemap, content taxonomy, editorial workflow and wireframe direction.
- Confirm GitHub collaborators, **Cloudflare Workers Free** access, static asset/file limits, `workers.dev` hostname, optional domain/budget owner and legal review needs.
- Approve [Cloudflare Free Node.js-compatible architecture](../architecture/06-cloudflare-free-node-deployment.md) and [ADR-0004](../decisions/ADR-0004-no-always-on-node-server.md); explicitly reject an always-on Node.js production server.
- Accept or revise initial ADRs and create a prioritized issue backlog.

**Exit:** one approved MVP baseline and named owners.

## Phase 1 — Site skeleton (implementation underway)

- Create the Astro **static-prerendered** project and agreed content layout; use Node.js for builds, not for an always-on production server.
- Implement accessible header/footer, section indexes, page templates and multilingual-ready navigation.
- Add design tokens, responsive image rules and clear metadata handling.
- Validate sample pages for each type before content expansion.

**Exit:** all key page types render in preview and navigation works.

## Phase 2 — Content and editorial completion

- Complete initial research briefs and source-backed articles.
- Add beginner learning paths, festival explainers, book guides and verified event examples.
- Introduce link, editorial, image rights and accessibility checks.
- Run review with first-time readers and correct confusion.

**Exit:** minimum curated content approved; no public placeholders.

## Phase 3 — Cloudflare release setup

- Confirm Cloudflare Workers Free + Static Assets, CI Node.js build, restricted deployment access, `workers.dev` hostname and optional domain/HTTPS.
- Configure preview/production, release gates, build artifact tracking and rollback.
- Test publishing, updating and withdrawing content.
- Verify that normal article/lesson requests hit static assets, do **not** invoke Workers, and remain within the free static asset limits.

**Exit:** repeatable verified deployment to a test environment.

## Phase 4 — Launch quality gates

- Test mobile/desktop, keyboard, screen reader, SEO metadata, performance, links, rights, privacy and event expiry.
- Conduct a small reader pilot; resolve blocking issues.
- Sign off the release and publish the official site.

**Exit:** owner-approved public launch.

## Phase 5 — Operate and learn

Review traffic quality, feedback, source updates, event freshness, accessibility and costs. Expand courses and language support according to evidence.

## Dependency rule

The owner authorized the first implementation pass with the Cloudflare Free static-first architecture. Public deployment remains blocked on CI, review, actual account authorization, copyright/accessibility checks and release sign-off. Do not implement deferred APIs/accounts merely because the static site is complete.
