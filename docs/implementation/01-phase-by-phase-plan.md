# Implementation Plan — Ordered Phases

**Status:** Proposed. This file is a plan, not evidence of implementation.

## Phase 0 — Discovery and approval (current)

- Agree audience, site purpose, content boundaries and launch priorities.
- Review sitemap, content taxonomy, editorial workflow and wireframe direction.
- Confirm GitHub collaborators, free-hosting constraints, domain/budget owner and legal review needs.
- Accept or revise initial ADRs and create a prioritized issue backlog.

**Exit:** one approved MVP baseline and named owners.

## Phase 1 — Site skeleton (future)

- Create the Astro static project and agreed content layout.
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

- Confirm supported hosting/CI integration, secure access and domain/HTTPS.
- Configure preview/production, release gates, build artifact tracking and rollback.
- Test publishing, updating and withdrawing content.

**Exit:** repeatable verified deployment to a test environment.

## Phase 4 — Launch quality gates

- Test mobile/desktop, keyboard, screen reader, SEO metadata, performance, links, rights, privacy and event expiry.
- Conduct a small reader pilot; resolve blocking issues.
- Sign off the release and publish the official site.

**Exit:** owner-approved public launch.

## Phase 5 — Operate and learn

Review traffic quality, feedback, source updates, event freshness, accessibility and costs. Expand courses and language support according to evidence.

## Dependency rule

No implementation PR until Phase 0 decisions are accepted. Do not implement deferred APIs/accounts merely because the static site is complete.
