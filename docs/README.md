# Documentation Index

This folder holds the **planning baseline** for the Chinese Culture website. All material is Markdown; no website code or infrastructure has been created.

| Area | Purpose | Start here |
|---|---|---|
| [Plan](plan/01-vision-and-goals.md) | Mission, audience, MVP, success measures and outreach | [Vision](plan/01-vision-and-goals.md) |
| [Structure](structure/01-information-architecture.md) | Navigation, sitemap, page types and content classification | [Information architecture](structure/01-information-architecture.md) |
| [Architecture](architecture/01-technology-selection.md) | Technical approach, hosting, deployment, repository design and APIs | [Cloudflare Free runtime and deployment](architecture/06-cloudflare-free-node-deployment.md) |
| [Content](content/01-editorial-strategy.md) | Editorial standards, courses, books, events and publishing | [Editorial strategy](content/01-editorial-strategy.md) |
| [Design](design/01-experience-and-visual-direction.md) | Appearance, usability, accessibility, search and localization | [Visual direction](design/01-experience-and-visual-direction.md) |
| [Implementation](implementation/01-phase-by-phase-plan.md) | Phases, prioritized tasks and launch gates | [Phases](implementation/01-phase-by-phase-plan.md) |
| [Operations](operations/01-security-privacy-and-legal.md) | Rights, privacy, security and ongoing maintenance | [Policy baseline](operations/01-security-privacy-and-legal.md) |
| [Decisions](decisions/ADR-0001-static-first-hosting.md) | Architectural decision records (ADRs) | [Hosting ADR](decisions/ADR-0001-static-first-hosting.md) |
| [Templates](templates/article-brief.md) | Briefs for future authors and reviewers | [Article template](templates/article-brief.md) |

## Hosting baseline

The project explicitly targets **Cloudflare Workers Free**: Astro is built using Node.js, while reader-facing pages are delivered as prerendered static assets. Cloudflare Workers is not an always-on Node.js VPS. Read [the Cloudflare Free hosting plan](architecture/06-cloudflare-free-node-deployment.md) and [ADR-0004](decisions/ADR-0004-no-always-on-node-server.md) before implementation.

## Recommended reading order

Vision → audiences → MVP → sitemap → content types → technical architecture → editorial workflow → phases → launch checklist.

## Documentation rules

- Mark each specification as **Proposed**, **Accepted** or **Superseded**. All initial architecture choices are proposed pending review.
- A decision change should update the corresponding ADR, impacted documents and implementation backlog in the same PR.
- Link to primary sources for historical claims and to official product documentation for technical decisions.
- No implementation begins until scope, language rollout, ownership and hosting decisions are accepted.
- Content submitted for public publication must pass factual, image-rights, accessibility and editorial review.
- Keep the repository private during planning; the eventual public website may be accessible independently.

## Current scope

Document the product and how to build it. Do not add application source, infrastructure definitions, workflow automation, API implementations or copyrighted books in this planning phase.
