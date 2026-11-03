# Repository and Documentation Structure

**Status:** Proposed

## Existing planning tree

- `README.md` — top-level orientation
- `docs/README.md` — complete documentation navigation
- `docs/plan/` — mission, audience, scope, measures and outreach
- `docs/structure/` — information hierarchy, sitemap, pages and metadata
- `docs/architecture/` — platform, Cloudflare Workers Free hosting, Node.js build/runtime boundaries, releases and future APIs
- `docs/content/` — publishing, lessons, books and events
- `docs/design/` — visual design, accessibility and localization
- `docs/implementation/` — phases, backlog and launch checklist
- `docs/operations/` — legal, privacy, monitoring and maintenance
- `docs/decisions/` — ADRs that record changes
- `docs/templates/` — reusable briefs for planning editorial items

## Hosting and build design rule

The future application must prerender normal pages with Astro and build-time Node.js, then publish to Cloudflare Workers Static Assets on Free. Any Worker script or server rendering requires review against [the Cloudflare hosting plan](06-cloudflare-free-node-deployment.md). No continuously running Node.js server will be added.

## Possible future application areas (not created)

A site/application folder for the Astro project, editorial content folders by content type and locale, a controlled media directory, automated checks, and deployment definitions. Concrete layout will be selected in the implementation phase.

## Rules

- Use lowercase kebab-case file names and numbered documents within a series.
- Use relative internal Markdown links that remain valid in GitHub.
- Keep one owner document for each policy; link rather than duplicate rules.
- Do not add placeholder code or folders that imply a working deployment.
- Every architecture or product change should reference the corresponding decision and acceptance criteria.

## Contribution conventions

Changes to accepted plans use a pull request with summary, reason, files impacted and validation checklist. Historical ADRs are preserved; a superseding ADR links back to earlier decisions.

## Ownership

Identify a product owner, content editor, technical reviewer and cultural/fact reviewer before starting implementation. One person may take multiple roles for an early project.
