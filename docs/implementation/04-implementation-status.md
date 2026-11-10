# Implementation Status

**Updated:** 2026-11-10
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
6. Complete native SQL dump download/import acceptance; configure an independently retained backup archive only if the desired retention justifies its cost.

## Backup and recovery

- D1 Time Travel is enabled by Cloudflare; retention depends on the D1 plan (Cloudflare documents 7 days for Workers Free and 30 days for Workers Paid).
- An isolated row-level restore rehearsal passed: the current migration was applied to a disposable D1 database, all 13 content items, 39 variants and 39 revisions were restored exactly, and foreign-key validation was clean. The disposable database was deleted.
- The D1 SQL export API completed an export job, but the generated SQL file has not yet been downloaded and imported. Native SQL dump restore remains unverified; see [D1 Backup and Recovery](../operations/05-d1-backup-and-restore.md).
- No independently retained R2 backup archive or scheduled export workflow is currently configured.

## Known scope boundaries

- The CMS publisher supports lessons, culture, festivals and books. The events page remains static and is not yet a CMS collection.
- The existing locale switcher relies on matching slugs; full contentId-based locale matching and redirect consolidation remain follow-up work.
- Media assets are stored in the repository under public/media/ through reviewed PRs. No separate R2 media bucket is used.
- The CMS never auto-merges PRs or writes directly to main.
- Automated CI uses local D1 only. Production D1 migration/import is isolated to the dedicated bootstrap workflow.

## Acceptance principle

The database schema and existing content migration are now complete in production. Do not call the CMS fully production-ready until GitHub App setup, authenticated live Admin CRUD, media/publication end-to-end acceptance and durable backup/restore evidence are complete. The public static website remains available independently of these remaining CMS release gates.

## Latest Admin regression and production deployment — 2026-11-09

Main after PR #48: `eac1e81561afc0568897138a43590765b822c680`.

- PR #45 corrected multi-element Admin DOM selectors.
- PR #46 added the missing `data-admin-banner` target used by Admin initialization.
- PR #47 corrected the browser test's accessible-name query without removing the accessibility assertion.
- PR #48 added Chromium coverage for independent English, Simplified Chinese and Spanish draft previews, including locale switching and distinct title/body read-back.
- Main CI [#42720346867](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42720346867) passed for the PR #47 merge.
- The PR #48 CI [#42720916493](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42720916493) passed both static-build and Admin Chromium jobs.
- Production Pages deployment [#42721208868](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42721208868) succeeded for Main `eac1e815`; Cloudflare deployment ID `b7c4fbd0-2755-4b20-9655-1aa55077b6f8`.

These browser tests run against the local development preview and do not constitute authenticated production D1 mutation acceptance.

## Current external release blockers

- Production Pages has the CMS D1 binding and Cloudflare Access configuration, but the repository-scoped GitHub App variables `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` and `GITHUB_APP_PRIVATE_KEY` are not configured. Publish and media-upload capabilities therefore remain disabled.
- P6.8 isolated Pages preview is complete: PR #51 preview run #42724699134 passed; the preview has no D1 binding or production variables, and the Admin API fails closed without an Access JWT.
- Authenticated production CRUD, media PR, publish/unpublish PR and native SQL dump restore remain unaccepted. Do not infer these from local CI or the production Access challenge test.


## Latest platform hardening — 2026-11-10

Main: `16155cc3bbfa20a45c9f6b806e8d2b1e8a133af1`.

- PR #49 refreshed Admin release evidence.
- PR #50 added isolated preview config, config guard and deployed browser smoke.
- PR #51 corrected Wrangler's unsupported custom Pages config path, pinned the preview runner to Ubuntu 24.04, and completed remote Chromium preview smoke.
- [Preview smoke #42724699134](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724699134) passed: English, Chinese and Spanish routes; production Admin build/no demo content; unauthenticated Admin session denied with HTTP 401.
- [Main CI #42724937729](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724937729) and [production Pages deploy #42724937781](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42724937781) passed.
- Preview configuration deliberately has no D1 binding or production secrets. Production D1 remains bound only to production.

## Remaining owner-level release gates

- Install the repository-scoped GitHub App and configure `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` and `GITHUB_APP_PRIVATE_KEY` in Cloudflare Pages production secrets.
- Complete authenticated production Admin CRUD with the authorized Cloudflare Access browser session.
- Complete human-reviewed media, publish and unpublish PR acceptance.
- Complete native SQL dump download/import restore and Pages rollback.
- P6.9 branch protection remains blocked by the current private-repository GitHub plan/API access; do not make the repository public. See the Cloudflare deployment runbook.
