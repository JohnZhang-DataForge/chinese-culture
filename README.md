# Chinese Culture — Website Planning & Documentation

> **Status:** Planning only · **Site:** Chinese culture education and outreach · **Repository:** Private · **Application code:** Not started

A public-facing website that introduces Chinese culture to readers worldwide through approachable lessons, reliable articles, traditional festivals, books and reading guides, and cultural-event announcements.

## Documentation

- [Documentation index](docs/README.md) — complete navigation
- [Vision and goals](docs/plan/01-vision-and-goals.md)
- [Audience and user journeys](docs/plan/02-audience-and-use-cases.md)
- [MVP and roadmap](docs/plan/03-scope-and-roadmap.md)
- [Site sitemap](docs/structure/02-sitemap-and-navigation.md)
- [Technology selection](docs/architecture/01-technology-selection.md)
- [System architecture](docs/architecture/02-system-architecture.md)
- [Editorial strategy](docs/content/01-editorial-strategy.md)
- [Learning curriculum](docs/content/02-learning-curriculum.md)
- [Implementation phases](docs/implementation/01-phase-by-phase-plan.md)
- [Launch checklist](docs/implementation/03-launch-checklist.md)

## Project principles

1. **Education first.** Clear, historically grounded explanations without stereotypes or unsupported claims.
2. **Free-first architecture.** Prefer a static content site on Cloudflare; avoid infrastructure or database charges until justified.
3. **International audience.** English-first at launch, with Chinese language support and translation-ready content structure.
4. **Git-first governance.** Markdown plans and editorial proposals reviewed through GitHub pull requests.
5. **Accessibility and trust.** Responsive reading, accessible navigation, image attribution, copyright checks and editorial review.
6. **Grow in phases.** Start with lessons, books, festivals and announcements; defer accounts, user uploads, registration and dynamic APIs.

## How to work with these documents

Read [vision](docs/plan/01-vision-and-goals.md) → [MVP](docs/plan/03-scope-and-roadmap.md) → [sitemap](docs/structure/02-sitemap-and-navigation.md) → [architecture](docs/architecture/02-system-architecture.md) → [implementation plan](docs/implementation/01-phase-by-phase-plan.md).

Decisions live under `docs/decisions/`; article, book and event briefs live under `docs/templates/`. This repository currently contains **planning materials only**. No site, deployment, or backend has been implemented.
