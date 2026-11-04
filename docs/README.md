# Chinese Culture Atlas — Documentation Index

**Documentation snapshot:** 2026-11-05  
**Verified main commit:** \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.

This index separates current implementation documentation from product plans. A feature described as proposed or pending must not be treated as deployed functionality.

## Start here

| If you need to... | Read |
|---|---|
| Understand the deployed system | [System overview](architecture/system-overview.md) |
| Understand Astro, Pages and CI deployment | [Cloudflare Pages architecture](architecture/cloudflare-pages-architecture.md) |
| Check the custom domain and redirect design | [Custom-domain architecture](architecture/custom-domain-architecture.md) |
| Understand current English routes and planned localization | [Bilingual routing](architecture/bilingual-routing.md) |
| Understand current Markdown fields and future translation requirements | [Localization content model](architecture/localization-content-model.md) |
| Understand the requested CMS target and current gap | [Admin CMS architecture](architecture/admin-cms-architecture.md) |
| Understand authentication status | [Authentication and authorization](architecture/authentication-authorization.md) |
| Understand how content is published today | [Content publishing workflow](architecture/content-publishing-workflow.md) |
| Understand GitHub Actions and credentials | [GitHub integration](architecture/github-integration.md) |
| Understand static images and future uploads | [Media management](architecture/media-management.md) |

## Architecture

- [System overview](architecture/system-overview.md)
- [Cloudflare Pages architecture](architecture/cloudflare-pages-architecture.md)
- [Custom-domain architecture](architecture/custom-domain-architecture.md)
- [Bilingual routing](architecture/bilingual-routing.md)
- [Localization content model](architecture/localization-content-model.md)
- [Admin CMS architecture](architecture/admin-cms-architecture.md)
- [Authentication and authorization](architecture/authentication-authorization.md)
- [Content publishing workflow](architecture/content-publishing-workflow.md)
- [GitHub integration](architecture/github-integration.md)
- [Media management](architecture/media-management.md)

Historical/planning architecture notes and ADRs remain in this folder tree. The unnumbered documents above are the current implementation-oriented references.

## Implementation and owner guides

- [Implementation status](implementation/implementation-status.md)
- [Administrator user guide](implementation/admin-user-guide.md)
- [Localization guide](implementation/localization-guide.md)
- [Content management guide](implementation/content-management-guide.md)
- [Development guide](implementation/development-guide.md)
- [Deployment guide](implementation/deployment-guide.md)
- [Testing guide](implementation/testing-guide.md)

**Important:** A browser-based Admin CMS is not implemented in the current source. The administrator guide documents the GitHub-based publishing process until the CMS is delivered.

## Operations

- [Domain and DNS change log](operations/domain-dns-change-log.md)
- [Cloudflare configuration](operations/cloudflare-configuration.md)
- [Admin credential setup](operations/admin-credential-setup.md)
- [GitHub and deployment token setup](operations/github-token-setup.md)
- [Security operations](operations/security-operations.md)
- [Rollback procedure](operations/rollback-procedure.md)
- [Incident recovery](operations/incident-recovery.md)
- [Backup and recovery](operations/backup-and-recovery.md)

## Existing project planning material

- [Product plan](plan/01-vision-and-goals.md)
- [Information architecture](structure/01-information-architecture.md)
- [Editorial strategy](content/01-editorial-strategy.md)
- [Design direction](design/01-experience-and-visual-direction.md)
- [Implementation roadmap](implementation/01-phase-by-phase-plan.md)
- [Architecture decisions](decisions/ADR-0001-static-first-hosting.md)
- [Content templates](templates/article-brief.md)

These planning documents are retained for context. Consult the implementation status and current architecture documents before assuming a planned feature exists.

## Documentation rules

- Distinguish designed, coded, tested, deployed and publicly verified states.
- Describe only behavior supported by source, configuration or operational evidence.
- Keep secrets and private keys out of Git and documentation.
- Update implementation status, repository map, the relevant architecture page and change log when a major feature is merged.
- Agent 0 owns \`docs/openspec/\`; this index does not create or replace those contracts.
