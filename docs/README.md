# Documentation Index

**Project stage (2026-11-10):** The static multilingual Astro website and D1-backed Admin foundation are deployed. PRs #45–#51 completed Admin regression coverage and isolated Pages preview/browser smoke. GitHub App credentials/installation, authenticated production CRUD and publish/unpublish acceptance remain outstanding. Cloudflare cost and free-tier limits are documented in the operations runbook.

## Start here

| Area | Contents |
|---|---|
| [Implementation status](implementation/04-implementation-status.md) | What exists today, gaps, verification evidence |
| [Repository map](architecture/07-implemented-repository-map.md) | Files, ownership and how source becomes static HTML |
| [Content schema and routes](architecture/08-content-schema-and-routing.md) | Metadata requirements and author workflow |
| [Developer runbook](implementation/05-developer-runbook.md) | Local preview, build, checks and Cloudflare deploy |
| [Test strategy](implementation/06-test-strategy.md) | Automated assertions and pending manual tests |
| [Change log](operations/03-change-log.md) | Chronological changes, rationale and known debt |
| [Cloudflare deployment status](operations/04-cloudflare-deployment.md) | Verified Pages, Functions, D1 and Access state |
| [Cloudflare cost and limits](operations/06-cost-and-limit-monitoring.md) | Free-tier limits, usage monitoring and cost guardrails |
| [CMS local runbook](runbooks/cms-d1-local-development.md) | Isolated local D1 migrations and Pages Functions development |
| [GitHub App publication setup](runbooks/github-app-publication.md) | Minimum repository permissions and Cloudflare Pages secret configuration |

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

**Node.js builds Astro**, which prerenders public pages to `dist/`; Cloudflare Pages serves them as static assets. The public article experience has no D1/API dependency. The private editorial workspace at `/admin/` uses Cloudflare Access and Pages Functions under `/api/admin/v1/`, with the `CMS_DB` binding to Cloudflare D1. D1 is the canonical editorial store; reviewed GitHub PRs generate the static Markdown snapshots consumed by Astro. GitHub App publication credentials and media upload are still pending. See [CMS local runbook](runbooks/cms-d1-local-development.md), [deployment model](architecture/04-deployment-and-environments.md), [Cloudflare plan](architecture/06-cloudflare-free-node-deployment.md) and [ADR-0004](decisions/ADR-0004-no-always-on-node-server.md).

## Document conventions

- Keep accepted architecture decisions as ADRs, with reasons and superseding changes.
- Update this index, implementation status, repository map and change log in PRs that add or restructure major functionality.
- Clearly distinguish **written**, **built**, **tested**, **deployed** and **publicly launched**.
- Keep educational citations and image rights in source Markdown, and never invent event schedules.
- The private GitHub repository may be the source for a public static site, but private design notes must not be packaged into public assets.
