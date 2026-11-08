# Implementation Status

**Updated:** 2026-11-09
**Production website:** https://chinese-culture.site
**CMS implementation:** PR #33 and importer fix PR #34 are merged.

## Production website

- Astro static website is deployed to Cloudflare Pages.
- English, Simplified Chinese and Spanish route trees are live.
- Public pages remain static; visitors do not query D1 or CMS APIs.
- Existing article carousel and public content pages are preserved.

## CMS production state

| Layer | Current status |
|---|---|
| Admin UI /admin/ | Deployed; protected by Cloudflare Access |
| Admin API /api/admin/v1/ | CRUD, translation, preview, media, submission and PR status/sync routes deployed |
| D1 CMS_DB | Production database migrated and populated |
| Conceptual articles | 13 |
| Locale variants | 39: 13 en, 13 zh-CN, 13 es |
| Initial revision snapshots | 39 |
| Pending submissions | 0 |
| Existing content importer | Idempotent; production bootstrap succeeded after PR #34 |
| GitHub publication | Implementation complete; GitHub App credentials/installation remain pending |
| Media upload | File-signature and rights metadata validation; media-only PR; D1 attaches after merge |
| Preview | Server-rendered safe Markdown preview |
| Publication state sync | Read-only GET PR status + explicit CSRF-protected POST sync after merge |

## Production D1 verification — 2026-11-09

Production D1 database chinese-culture-cms was queried directly after the successful bootstrap workflow:

- content_items: 13
- content_variants: 39
- content_revisions: 39
- cms_submissions: 0
- Locale distribution: en 13, es 13, zh-CN 13.
- Collection distribution per locale: books 2, culture 3, festivals 3, lessons 5.
- Every conceptual content ID has exactly three locale variants.
- No locale variant has an empty required title, description or Markdown body.
- All 39 variants have status published.
- All 39 current revisions have a matching immutable revision snapshot.
- No content/parent collection mismatch was found.
- Existing Unsplash cover URLs and localized alt text were preserved.

The production bootstrap workflow, main CI and Pages deployment all completed successfully after PR #34 merged:
- [D1 bootstrap run #42531011592](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42531011592)
- [Main CI run #42531011576](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42531011576)
- [Pages deployment run #42531011639](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42531011639)

## Verified production security and deployment configuration

- Cloudflare Access application protects /admin, /admin/*, /api/admin and /api/admin/*.
- The allow policy is restricted to the configured administrator email.
- ADMIN_EMAIL, ADMIN_ORIGIN, CF_ACCESS_AUD and CF_ACCESS_TEAM_DOMAIN are configured in Pages production.
- ADMIN_CSRF_SECRET is configured as a Pages secret (secret values are not readable through the Cloudflare API).
- CMS_DB is bound to the production D1 database.
- Pages deployment includes the Functions bundle and static output.
- GitHub App variables GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY are not present in the production Pages environment. Publish and media actions remain disabled until the repository-scoped App is installed and configured.

## Remaining release gates

1. Install a GitHub App on this repository only with Contents read/write, Pull Requests read/write and Checks read-only. Do not grant merge or branch-protection bypass permissions.
2. Configure GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY as Pages production variables/secrets.
3. Sign in to Admin through Cloudflare Access and perform live create/edit/save/reload/translation/preview tests.
4. Perform a reviewed media PR, merge it, and verify the media record attaches to D1 only after merge.
5. Perform publish and unpublish PR acceptance, including Pages deployment and D1 status synchronization.
6. Complete a durable D1 backup/export/restore test and record the recovery procedure.

## Known scope boundaries

- The CMS publisher supports lessons, culture, festivals and books. The events page remains static and is not yet a CMS collection.
- The existing locale switcher relies on matching slugs; full contentId-based locale matching and redirect consolidation remain follow-up work.
- Media assets are stored in the repository under public/media/ through reviewed PRs. No separate R2 media bucket is used.
- The CMS never auto-merges PRs or writes directly to main.
- Automated CI uses local D1 only. Production D1 migration/import is isolated to the dedicated bootstrap workflow.

## Acceptance principle

The database schema and existing content migration are now complete in production. Do not call the CMS fully production-ready until GitHub App setup, authenticated live Admin CRUD, media/publication end-to-end acceptance and durable backup/restore evidence are complete. The public static website remains available independently of these remaining CMS release gates.
