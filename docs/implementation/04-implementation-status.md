# Implementation Status

**Updated:** 2026-11-09  
**Production website:** https://chinese-culture.site  
**CMS integration:** PR #33 — [D1 article CMS and reviewed publication workflow](https://github.com/JohnZhang-DataForge/chinese-culture/pull/33)

## Production website

- Astro static website is deployed to Cloudflare Pages.
- English, Simplified Chinese and Spanish route trees are live.
- Public articles remain static; visitors do not query D1 or CMS APIs.
- Existing article carousel and public content pages are preserved.

## CMS architecture

| Layer | Current status |
|---|---|
| Admin UI /admin/ | Implemented, Cloudflare Access protected |
| Admin API /api/admin/v1/ | CRUD, translation, preview, media, submission and PR status/sync routes implemented |
| D1 CMS_DB | Database provisioned and bound; production migration/import pending PR #33 merge |
| D1 content schema | Initial migration defined for articles, locale variants, revisions, media metadata and submissions |
| Existing content importer | Idempotent importer for 39 Markdown variants (13 per locale), deterministic content IDs |
| Local test path | Wrangler local D1 migration + Pages Functions integration smoke test |
| GitHub publication | Repository-scoped GitHub App implementation complete; credentials/installation pending |
| Media upload | File-signature and rights metadata validation; media-only PR; D1 attaches after merge |
| Preview | Server-rendered safe Markdown preview |
| Publication status | Read-only GET PR status + explicit CSRF-protected POST synchronization after merge |

## Verified production security and deployment configuration

- Cloudflare Access app protects /admin/* and /api/admin/*.
- Exact-email allow policy is configured.
- ADMIN_EMAIL is configured in Pages production.
- ADMIN_CSRF_SECRET is stored as a Pages secret.
- CMS_DB binding points to the provisioned chinese-culture-cms D1 database.
- Pages deployment workflow has successfully deployed the Functions bundle and static output.
- GitHub App credentials are not configured; the Admin session therefore advertises publish=false and mediaUpload=false until the manual setup is completed.

## Current release gates

1. Merge PR #33 after its CI passes.
2. Confirm the CMS D1 bootstrap workflow applies the production migration.
3. Confirm importer reports exactly 13 published variants in each of en, zh-CN and es, and 13 conceptual content items.
4. Install the GitHub App on this repository only with Contents read/write, Pull Requests read/write and Checks read-only.
5. Configure GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY as Cloudflare Pages production variables/secrets.
6. Run live Admin CRUD, translation, preview, media PR, publish PR, unpublish PR and merge-to-D1 synchronization acceptance tests.
7. Document and test production D1 backup/restore and rollback.

## Known scope boundaries

- The CMS publisher currently supports lessons, culture, festivals and books. The events page remains a static information page and is not yet a CMS content collection.
- The existing locale switcher relies on matching slugs; full contentId-based locale matching and redirect consolidation remain follow-up work.
- Media assets are stored in the repository under public/media/ through reviewed PRs. No separate R2 bucket is used.
- The CMS does not auto-merge PRs or write directly to main.
- Production D1 is not modified by CI. Only the dedicated CMS bootstrap workflow applies production migrations/imports after merge.

## Acceptance principle

Do not describe the CMS as fully production-ready until the migration/import, GitHub App setup, live CRUD/publication/media checks and backup/restore evidence all pass. The public static site remains available independently of these CMS release gates.
