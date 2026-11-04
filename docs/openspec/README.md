# OpenSpec — Chinese Culture Atlas

**Program:** Bilingual public site + GitHub-backed Admin CMS  
**Production target:** https://chinese-culture.site  
**Status:** Architecture proposal and shared contracts prepared for review  
**Architecture baseline:** Astro 5 static public site + Cloudflare Pages + separately deployed Cloudflare Worker for authenticated administration.

## Source-of-truth rules

1. This OpenSpec proposal and the contracts under contracts/ are the shared interface authority for Agents 1–7.
2. The current main branch is the implementation baseline. Read it again before every implementation PR.
3. Agents must not redefine locale paths, content fields, status semantics, API paths, error shapes, authentication or publishing behavior independently.
4. If implementation reveals a contract defect, open a contract-change request against Agent 0 before changing code. Agent 0 updates the contract and announces the new version.
5. GitHub main is the production source of truth. Public deployment is produced only from a reviewed merge to main.
6. Drafts and unpublished content must never appear in public build output.

## Documents

- [Program proposal](changes/bilingual-admin-cms/proposal.md) — goals, requirements, scope, acceptance and dependencies.
- [Architecture and design](changes/bilingual-admin-cms/design.md) — target topology, identity, content lifecycle, media and deployment.
- [Implementation tasks](changes/bilingual-admin-cms/tasks.md) — sequenced work and exit gates.
- [Content contract](contracts/content-schema.md) — locale, stable IDs, Markdown frontmatter, translations and status.
- [Admin API contract](contracts/admin-api.openapi.yaml) — OpenAPI 3.1 interface shared by Admin UI and Worker.
- [Agent ownership](contracts/agent-ownership.md) — file ownership, responsibilities and dependency gates.
- [Integration protocol](contracts/integration-protocol.md) — branch rules, review, merge order and production acceptance.

## Current baseline inspected

- Repository: JohnZhang-DataForge/chinese-culture (private).
- Default branch: main.
- Baseline commit on 2026-11-05: 539b37c9bfa5363f7149c95563bd549957eeff3d.
- Existing application: Astro 5.16 static output; four Markdown collections (lessons, culture, festivals, books); 13 starter guides.
- Existing CI: GitHub Actions static build and static-output verification.
- Existing deployment: Cloudflare Pages Direct Upload via Wrangler.
- Latest observed main runs at baseline: static CI run 41932129795 passed; Pages deployment run 41932129872 passed.
- Current repository had no open PRs when inspected. Existing main branch was reported unprotected. The old feature branch feat/astro-cloudflare-free-mvp is divergent (7 commits ahead and 13 behind main); do not merge it as a substitute for current main.
- Existing docs contain stale deployment statements and describe localization, APIs and CMS as future work. Agent 7 must reconcile them against verified current evidence.

The GitHub API exposes remote commits and branches, not a local working tree. No claim is made that a local checkout has been checked for uncommitted changes.

## Status vocabulary

- **Proposed:** contract written, not yet implemented.
- **Ready:** contract reviewed and frozen; dependent agents may begin.
- **In progress:** implementation branch or PR exists.
- **Verified:** tests and required runtime checks passed.
- **Accepted:** Agent 0 approved architecture and PR checks.
- **Released:** merged to main and production deployment/browser checks passed.

A document being written is not evidence that a feature is implemented or deployed.
