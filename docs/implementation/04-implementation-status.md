# Implementation Status

**Updated:** 2026-11-11 (after PR #56 merge and production acceptance)
**Production website:** https://chinese-culture.site
**CMS implementation:** PR #33 and importer fix PR #34 are merged.

## Production website

- Latest production release: Main commit `0e621be26009c4dabe69843dfb42d65ad474587c`; Cloudflare deployment `cddb8296-5d94-4bc9-9a87-c8ea31ade484` succeeded on 2026-11-10 23:07 UTC.
- Main CI run [#42920572091](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42920572091) passed `static-build` and `admin-browser`; Pages deployment run [#42920572127](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42920572127) passed build, deploy and production route/Access smoke checks.
- PR #54 documentation CI [#42920011297](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42920011297) passed `static-build` and Chromium `admin-browser` before merge.

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
- Native D1 SQL export/download/import/restore passed in workflow [#42726758673](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42726758673): 212,583-byte SQL dump, exact production/restored table and locale counts, zero foreign-key violations, and disposable D1 deleted. The SQL file was not retained as a durable backup artifact; see [D1 Backup and Recovery](../operations/05-d1-backup-and-restore.md).
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
- Authenticated production CRUD, media PR and publish/unpublish PR remain unaccepted. Native D1 SQL dump download/import/restore passed in workflow #42726758673; Pages rollback remains pending. Do not infer authenticated CRUD acceptance from local CI or the production Access challenge test.


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
- Native D1 SQL dump download/import/restore passed in workflow #42726758673; complete the separate Pages rollback rehearsal.
- The repository is now public. A read-only GitHub API query returned no repository rulesets; the connected integration cannot create rulesets or read the branch-protection endpoint. The owner must configure a `main` branch ruleset in GitHub Settings → Rules → Rulesets; see the Cloudflare deployment runbook. Public visibility is not a substitute for branch protection.


## Native D1 SQL backup/restore verified — 2026-11-11

- [Workflow #42726758673](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42726758673) completed successfully.
- Exported 212,583-byte D1-compatible SQL dump; SHA-256: `6b44d10270091667f6e42ca70921422b4358d287bf6986991388392355ab1b56`.
- Imported into a disposable US D1 database; counts matched the production snapshot (13 content items, 39 variants, 39 revisions, 0 submissions; 13 variants per locale); foreign-key check returned zero violations.
- Temporary D1 was deleted. The SQL dump was not retained as an artifact.
- Native SQL restore rehearsal is complete; Pages rollback remains pending.


## Repository visibility and Actions recovery — 2026-11-11

- The repository was made public by the owner to restore GitHub-hosted runner availability after GitHub reported failed recent account payments / an insufficient spending limit.
- Failed Main CI run #42916306326 was rerun (attempt 4): `static-build` and `admin-browser` both passed.
- Failed Pages deployment run #42916306335 was rerun (attempt 4): dependency install, build/verify, deployment credential check, Cloudflare Pages deployment and production route/Cloudflare Access smoke all passed.
- Cloudflare confirms production deployment `5fe2af05-4119-4578-a125-f7f17eadd699` for commit `a938e4b2ffdc43b6d962263873d985f51ade354b` succeeded.
- The GitHub API currently returns an empty repository ruleset list. The connected GitHub integration has no ruleset-write operation and cannot read branch protection. The repository owner must configure the `main` ruleset in GitHub UI.
- Early implementation PRs #22, #23, #4 and #6 were closed as superseded by the newer implementation already on Main. PR #12 (documentation draft) and PR #2 (content inventory/style guide draft) remain open for separate review; neither was merged or discarded.


## GitHub App production configuration check — 2026-11-11

A read-only Cloudflare Pages project configuration check found no `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` or `GITHUB_APP_PRIVATE_KEY` production entries. `CMS_DB` remains bound to the existing production D1 database. The CMS publisher cannot be accepted until the repository-scoped GitHub App is installed and its three production settings are configured. No credential values were read or exposed.


## Latest post-PR #56 acceptance snapshot — 2026-11-11

- Main: `6763fa6faceff0ef5da6b62e3520d4f51e093c7c`.
- Main CI #42922241144: `static-build` and `admin-browser` passed.
- Pages deployment #42922241177: build, deploy and production route/Cloudflare Access smoke passed.
- Cloudflare Pages read-back: production deployment `b19551bd-4c07-422b-9600-2f99c0bc1697` serves the current Main commit.
- Production configuration read-back still shows `CMS_DB` and existing Access/admin settings. The production variable-name list contains no `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, or `GITHUB_APP_PRIVATE_KEY`; GitHub App publish/media acceptance remains blocked. No secret values were read.
- GitHub repository rulesets API currently returns an empty list; P6.9 remains owner-blocked.
