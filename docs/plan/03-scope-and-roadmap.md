# MVP Scope and Roadmap

**Status:** Proposed

## MVP — public educational website

**Must have**
- Home, About, Learn, Culture, Festivals, Books, Events, Contact and core legal-information pages.
- Article/lesson pages, topic indexes, festival detail pages, book guide pages and event announcement pages.
- Mobile-responsive layouts; headings and navigation usable with keyboard and screen readers.
- English content baseline with translation-ready information architecture.
- Metadata for search, sharing, authorship, review date and source references.
- Git-reviewed publishing and documented correction procedure.

## Minimum launch content

Proposed editorial targets, subject to available reviewers:
- 6–10 introductory lessons grouped in a coherent path.
- 8–12 evergreen articles across festivals, arts, traditions and cultural history.
- 4 festival explainers, 5 book guides and 2 example or real verified event announcements.
- About, editorial policy, sources/attribution and contact instructions.

Quality beats volume; no placeholder article should be presented as authoritative.

## Phase 2 — make learning and discovery easier

Add on-site search if warranted; quizzes or printable worksheets; additional courses; more translations; topical landing pages; and improved event filtering. Keep interactive functions optional and evaluate privacy impact.

## Phase 3 — community features, only when justified

Consider event submissions, newsletters, registrations, educator collections or user profiles only after demonstrating demand and documenting data retention, moderation and operating cost.

## Mandatory Cloudflare Free hosting constraint

The MVP must run as Astro-generated static assets on Cloudflare Workers Free. Use Node.js for builds, not as a permanent backend server. Do not introduce SSR, always-on Node processes, databases or per-request compute without a separate approved ADR. See [hosting plan](../architecture/06-cloudflare-free-node-deployment.md).

## Scope-control rules

- New features need a user problem, measurable benefit, owner, cost impact and acceptance criteria.
- Do not add a database just to store publicly readable articles.
- Avoid implementing a CMS, authentication or OpenAPI service for hypothetical future requirements.
- Prioritize site clarity and editorial correctness over animations and novelty.

## Exit gate for planning

Approve sitemap, content types, MVP content list, design baseline, free-hosting tradeoffs and editorial ownership before creating implementation tickets.
