# Chinese Culture Atlas — Documentation Index

**Documentation snapshot:** 2026-11-05  
**Verified main baseline:** `539b37c9bfa5363f7149c95563bd549957eeff3d`.

This index distinguishes the current deployed implementation from the proposed bilingual CMS program. A proposal or open PR is not proof of a production feature.

## Start here

| Need | Document |
|---|---|
| Understand the deployed system | [System overview](architecture/system-overview.md) |
| Understand Pages, CI and static hosting | [Cloudflare Pages architecture](architecture/cloudflare-pages-architecture.md) |
| Check domain, DNS and canonical redirects | [Custom-domain architecture](architecture/custom-domain-architecture.md) |
| Understand current and proposed locale routes | [Bilingual routing](architecture/bilingual-routing.md) |
| Understand current and proposed content schema | [Localization content model](architecture/localization-content-model.md) |
| Understand the CMS target and integration risks | [Admin CMS architecture](architecture/admin-cms-architecture.md) |
| Understand current and proposed authentication | [Authentication and authorization](architecture/authentication-authorization.md) |
| Understand publishing semantics | [Content publishing workflow](architecture/content-publishing-workflow.md) |
| Understand GitHub workflows and credentials | [GitHub integration](architecture/github-integration.md) |
| Understand static assets and proposed uploads | [Media management](architecture/media-management.md) |

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

## Implementation and owner guides

- [Implementation status](implementation/implementation-status.md)
- [Administrator user guide](implementation/admin-user-guide.md)
- [Localization guide](implementation/localization-guide.md)
- [Content management guide](implementation/content-management-guide.md)
- [Development guide](implementation/development-guide.md)
- [Deployment guide](implementation/deployment-guide.md)
- [Testing guide](implementation/testing-guide.md)

**Important:** A production Admin CMS is not merged or deployed. Agent 4's draft UI is mock-only in development. Use the GitHub publishing process until the real backend and Access protection are released.

## Operations

- [Domain and DNS change log](operations/domain-dns-change-log.md)
- [Cloudflare configuration](operations/cloudflare-configuration.md)
- [Admin credential setup](operations/admin-credential-setup.md)
- [GitHub and deployment token setup](operations/github-token-setup.md)
- [Security operations](operations/security-operations.md)
- [Rollback procedure](operations/rollback-procedure.md)
- [Incident recovery](operations/incident-recovery.md)
- [Backup and recovery](operations/backup-and-recovery.md)

## Agent 0 shared contract proposal

[Agent 0 OpenSpec PR #3](https://github.com/JohnZhang-DataForge/chinese-culture/pull/3) contains the proposed content schema, Admin API, architecture, ownership and integration protocol. It is Proposed, not Ready or merged. Do not create a parallel contract or assume the target features are already deployed.

## Existing project planning material

Product plans, information architecture, editorial strategy, design direction, implementation roadmap, ADRs and content templates remain in their existing folders. Consult the implementation status and current architecture documents before assuming a planned feature exists.

## Documentation rules

- Distinguish proposed, coded, tested, deployed and publicly verified states.
- Describe only behavior supported by source, configuration or operational evidence.
- Keep secrets and private keys out of Git and documentation.
- Update implementation status, repository map, relevant architecture pages and change log after each major feature is merged.
- Agent 0 owns `docs/openspec/`; Agent 7 must not edit that directory.
