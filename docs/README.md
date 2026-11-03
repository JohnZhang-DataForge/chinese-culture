# Documentation Index

**Project stage:** Static Astro MVP source and initial editorial content were merged into **main** through [PR #1](https://github.com/JohnZhang-DataForge/chinese-culture/pull/1) after passing build checks. No public Cloudflare deployment is verified. Documentation includes both proposed long-term plans and the concrete implemented baseline.

## Start here

| Area | Contents |
|---|---|
| [Implementation status](implementation/04-implementation-status.md) | What exists today, gaps, verification evidence |
| [Repository map](architecture/07-implemented-repository-map.md) | Files, ownership and how source becomes static HTML |
| [Content schema and routes](architecture/08-content-schema-and-routing.md) | Metadata requirements and author workflow |
| [Developer runbook](implementation/05-developer-runbook.md) | Local preview, build, checks and Cloudflare deploy |
| [Test strategy](implementation/06-test-strategy.md) | Automated assertions and pending manual tests |
| [Change log](operations/03-change-log.md) | Chronological changes, rationale and known debt |

## Long-term planning areas

| Folder | Focus |
|---|---|
| [plan/](plan/01-vision-and-goals.md) | Mission, audience, scope, budget, outreach |
| [structure/](structure/01-information-architecture.md) | Sitemap, page types and taxonomy |
| [architecture/](architecture/01-technology-selection.md) | Technical decisions and deployment |
| [content/](content/01-editorial-strategy.md) | Editorial policy, learning, books and events |
| [design/](design/01-experience-and-visual-direction.md) | Visual direction, accessibility and localization |
| [implementation/](implementation/01-phase-by-phase-plan.md) | Milestones, backlog, quality gates |
| [operations/](operations/01-security-privacy-and-legal.md) | Copyright, privacy and maintenance |
| [decisions/](decisions/ADR-0001-static-first-hosting.md) | Architecture decision records |
| [templates/](templates/article-brief.md) | Content and ADR briefs |

## Architecture baseline

**Node.js builds Astro**, which prerenders all normal pages to `dist/`. **Cloudflare Workers Static Assets** will distribute those assets on the Free plan. No server entrypoint, runtime API, database or permanent Node.js process is part of the MVP. See [Cloudflare plan](architecture/06-cloudflare-free-node-deployment.md) and [ADR-0004](decisions/ADR-0004-no-always-on-node-server.md).

## Document conventions

- Keep accepted architecture decisions as ADRs, with reasons and superseding changes.
- Update this index, implementation status, repository map and change log in PRs that add or restructure major functionality.
- Clearly distinguish **written**, **built**, **tested**, **deployed** and **publicly launched**.
- Keep educational citations and image rights in source Markdown, and never invent event schedules.
- The private GitHub repository may be the source for a public static site, but private design notes must not be packaged into public assets.
