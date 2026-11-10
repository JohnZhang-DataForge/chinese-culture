# Chinese Culture Atlas — Documentation Index

**Updated:** 2026-11-11  
**Main baseline:** `a30d0872380d4da97054646138dbab703999bde6`  
**Production deployment:** `a087d8b6-ecbe-4a36-93dc-275f4b62515d` (same Main commit)

The multilingual static website and D1-backed Admin foundation are deployed. GitHub App setup, authenticated production CRUD/publishing acceptance, owner-configured main ruleset and Pages rollback rehearsal remain open. Do not treat implementation, CI success, deployment success and full production acceptance as interchangeable.

## Start here

| Area | Contents |
|---|---|
| [Implementation status](implementation/04-implementation-status.md) | Current production state, verified evidence and release gates |
| [Repository map](architecture/07-implemented-repository-map.md) | Source layout and data flow |
| [Content schema and routes](architecture/08-content-schema-and-routing.md) | Normative content contract and locale routing |
| [Content inventory](content/06-content-inventory.md) | 13 concepts, 39 locale variants and route conventions |
| [Chinese style guide](content/07-simplified-chinese-editorial-style-guide.md) | Preferred terminology and translation standards |
| [Chinese editorial review](content/08-zh-cn-editorial-review-2026-11-11.md) | Translation-fidelity corrections and source-link review |
| [Developer runbook](implementation/05-developer-runbook.md) | Local development, tests and environment isolation |
| [Cloudflare deployment](operations/04-cloudflare-deployment.md) | Pages, Functions, D1 and Access release evidence |
| [D1 backup and restore](operations/05-d1-backup-and-restore.md) | Native SQL restore rehearsal and recovery procedure |
| [Cost and limits](operations/06-cost-and-limit-monitoring.md) | Free-tier limits and cost guardrails |
| [CMS local runbook](runbooks/cms-d1-local-development.md) | Local D1 migrations and Pages Functions testing |
| [GitHub App publication setup](runbooks/github-app-publication.md) | Minimum App permissions and required production settings |
| [Admin CMS architecture](architecture/admin-cms-architecture.md) | Current D1-backed Admin topology and GitHub App blocker |
| [GitHub integration](architecture/github-integration.md) | CI, deployment and CMS App boundaries |
| [Administrator User Guide](implementation/admin-user-guide.md) | Access, editing and publication boundaries |
| [Content Management Guide](implementation/content-management-guide.md) | Locale, D1 source of truth and editorial workflow |
| [Admin credential setup](operations/admin-credential-setup.md) | Access configuration and pending App secrets |
| [Pages rollback procedure](operations/rollback-procedure.md) | Owner-approved production rollback steps |
| [OpenSpec tasks](openspec/changes/bilingual-admin-cms/tasks.md) | Milestones, acceptance gates and outstanding work |

## Architecture baseline

- Astro generates public locale routes as static HTML.
- Public article pages consume reviewed Markdown snapshots on `main`; they do not query D1 at request time.
- Cloudflare Pages Functions provide the private Admin API under `/api/admin/v1/`.
- Cloudflare Access protects `/admin/*` and `/api/admin/*`.
- D1 (`CMS_DB`) is the canonical editorial store for content, translations and revisions.
- The CMS creates reviewed GitHub branches/PRs; it does not merge PRs or write directly to `main`.
- The repository-scoped GitHub App is not yet configured, so PR publication and media upload remain blocked.

## Documentation conventions

- CC-CONTENT-001 v1.2.0 and the Admin API OpenAPI contract are normative; do not create parallel schemas.
- Clearly distinguish written, implemented, tested, deployed and accepted.
- Update the implementation status, change log and this index when major architecture or production state changes.
- Never document secret values or invent contact details, events, author credentials or review sign-offs.
- Keep old proposals visibly marked as superseded when their architecture no longer matches production.
