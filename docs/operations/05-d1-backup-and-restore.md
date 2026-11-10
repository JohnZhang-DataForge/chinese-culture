# D1 Backup and Recovery Runbook

**Database:** chinese-culture-cms  
**Production binding:** CMS_DB  
**Database ID:** 8b6f6c98-06fe-49eb-adbc-690d4b57c058  
**Last reviewed:** 2026-11-09

## 1. Recovery options

### D1 Time Travel — first-line recovery

Cloudflare D1 Time Travel is always enabled and does not require a scheduled backup job. It supports point-in-time recovery to a minute within the plan's retention window. Cloudflare documents up to 7 days for Workers Free and up to 30 days for Workers Paid; verify the database/account entitlement before relying on a particular retention period.

Before a risky migration, bulk update or destructive operation, capture the current bookmark:

```bash
npx wrangler d1 time-travel info chinese-culture-cms
```

Record the returned current bookmark in the change/incident record. For a restore, stop or restrict Admin writes first, confirm the target bookmark and obtain explicit owner approval. Restoring overwrites the target database in place:

```bash
npx wrangler d1 time-travel restore chinese-culture-cms --bookmark=<RECORDED_BOOKMARK>
```

Capture the previous bookmark printed by the restore command. It is needed to undo the restore if the selected recovery point is wrong. After recovery, verify table counts, locale coverage, revision history, foreign keys and the public Pages deployment.

**Warning:** Never run a Time Travel restore against production as a test. It is destructive.

### SQL export — independent archive or migration

Create a SQL dump of the production database:

```bash
npx wrangler d1 export chinese-culture-cms --remote --output=./chinese-culture-cms-backup.sql
```

Keep the resulting SQL file in an approved private, encrypted backup location outside the public repository and outside the same account security boundary. Do not commit production dumps, administrator data or secrets to Git.

To rehearse an import, first create a separate empty D1 database, then import the SQL file into that target:

```bash
npx wrangler d1 execute <RESTORE_TEST_DATABASE> --remote --file=./chinese-culture-cms-backup.sql
```

Do not replace the production database name in this rehearsal command. Verify the restored tables and rows before considering the backup usable. Keep the SQL file until the restore has been validated.

### Longer-term R2 archive — optional, not currently enabled

Cloudflare documents a Workflow pattern that exports D1 through the REST API and stores the generated SQL dump in a private R2 bucket. This repository does not currently have a dedicated backup bucket or scheduled D1 export Workflow. Do not claim an independent long-term archive exists. Enable one only after choosing retention, access controls, encryption and the associated R2/Workflow cost.

## 2. Production data validation checklist

Run read-only queries against production or a restored test database:

```sql
SELECT COUNT(*) AS content_items FROM content_items;
SELECT locale, COUNT(*) AS variants
FROM content_variants
GROUP BY locale
ORDER BY locale;
SELECT COUNT(*) AS revisions FROM content_revisions;
SELECT COUNT(*) AS submissions FROM cms_submissions;
PRAGMA foreign_key_check;
```

Expected baseline from the 2026-11-09 production import:

| Check | Expected |
|---|---:|
| content_items | 13 |
| content_variants | 39 |
| en | 13 |
| zh-CN | 13 |
| es | 13 |
| content_revisions | 39 |
| cms_submissions | 0 |
| Missing locale variants | 0 |
| Foreign-key violations | 0 |

Also verify that each contentId has exactly one variant per locale, each current revision has a matching immutable revision snapshot, and published variants retain non-empty title, description and body content.

These are baseline counts, not permanent constants. Update the expected counts after approved editorial changes.

## 3. Verified rehearsal — 2026-11-09

- Production D1 was confirmed to use the `production` storage version.
- The D1 export API completed an export job and generated a short-lived signed SQL dump URL. A download attempt from the connected execution environment returned HTTP 403, so the SQL bytes were not obtained and native SQL-dump import remains unverified. Do not treat export-job completion alone as a verified backup.
- A separate disposable D1 database was created with US jurisdiction and read replication disabled.
- The current main-branch migration was applied to the empty test database.
- Production rows were copied into the isolated database in dependency order and compared row-for-row.
- Exact results: content_items 13/13, content_variants 39/39, content_revisions 39/39, cms_submissions 0/0; all rowsets were identical.
- The restored database returned 13 variants in each of en, zh-CN and es, and PRAGMA foreign_key_check returned no violations.
- The disposable test database was deleted after verification.

This rehearsal validates schema reconstruction and exact row-level recovery into an isolated D1 database. It is not a substitute for a native SQL dump download/import test or an independently retained backup archive.

## 4. Incident sequence

1. Pause Admin mutations or restrict the Access application to prevent writes during recovery.
2. Determine the incident time and select the latest known-good Time Travel bookmark before the incident.
3. Record the current bookmark before changing anything.
4. Obtain owner approval before a destructive production restore.
5. Restore using the recorded bookmark, or import a verified SQL dump into a replacement database if the recovery plan requires that path.
6. Verify all four tables, locale coverage, revision relationships and foreign keys.
7. Verify the Pages production D1 binding still points to the intended database.
8. Sign in to Admin and perform a read-only list/detail check before re-enabling writes.
9. Verify public routes and the latest Pages deployment.
10. Record the incident, recovery bookmark, validation counts and any lost edits.

## 5. Official references

- [D1 Time Travel and backups](https://developers.cloudflare.com/d1/reference/time-travel/)
- [D1 import and export data](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Export and save D1 database to R2 with Workflows](https://developers.cloudflare.com/workflows/examples/backup-d1/)


## 6. Verified native SQL dump download/import — 2026-11-11

The earlier connected execution environment could create a D1 export job but could not download the signed R2 URL. A dedicated GitHub Actions runner completed the full native SQL round-trip.

- Workflow: [D1 native SQL backup and restore rehearsal #42726758673](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/42726758673) — PASS.
- Export format: D1-compatible SQL.
- Export bookmark: `00000012-00000000-0000511f-8358356091bd1f609e361b2a63bd9f8d`.
- Downloaded SQL size: 212,583 bytes.
- SQL SHA-256: `6b44d10270091667f6e42ca70921422b4358d287bf6986991388392355ab1b56`.
- Temporary US-jurisdiction D1: `cms-restore-rehearsal-42726758673`, ID `25f7d9ab-73ec-4d88-a4b5-05082867c27b`.
- Restored counts: content_items 13; content_variants 39; content_revisions 39; cms_submissions 0.
- Locale counts: en 13; es 13; zh-CN 13.
- `PRAGMA foreign_key_check`: zero violations.
- Restored table counts, locale distribution and FK results exactly matched the production snapshot captured before export.
- The temporary database was deleted after validation.
- The SQL file existed only in the runner's temporary directory and was deleted; no GitHub artifact or durable archive was created.

This closes the native SQL download/import rehearsal. It does not create an independently retained backup archive and does not complete the separate Pages rollback rehearsal.


## 7. Pages production rollback preflight — 2026-11-11

Cloudflare Pages rollback is a production deployment mutation. This section records read-only preflight evidence only; no rollback request was issued.

Current Cloudflare API read-back:

| Role | Deployment ID | Commit | Status | Created (UTC) |
|---|---|---|---|---|
| Current production | `ac9f2411-f9c6-49f8-ac98-d7e81e494f1b` | `0d45537ab85f6d14872a9898301765fa20ac2700` | Success | 2026-11-10 00:08:38 |
| Previous production | `c4df8db2-ec98-4d72-8c9b-de589b4bee14` | `16155cc3bbfa20a45c9f6b806e8d2b1e8a133af1` | Success | 2026-11-10 00:01:18 |

Both deployments are production deployments on the `main` branch. The current production aliases remain attached to the latest deployment. The older deployment is the immediate previous successful production candidate observed at preflight time.

### Critical data boundary

A Pages rollback changes the deployed application version; it does **not** restore or roll back the connected D1 database. The production D1 database remains `8b6f6c98-06fe-49eb-adbc-690d4b57c058`. Before any rollback, verify that the target build is compatible with the current D1 schema and data. Never assume that rolling back Pages also reverses a D1 migration or content edit.

### Controlled rollback procedure

1. Re-read the Pages project and deployment list immediately before acting; deployment IDs above are historical evidence, not permanent targets.
2. Confirm the current latest deployment ID and the intended previous deployment ID, and confirm both are successful production deployments.
3. Review intervening source changes and D1 migrations. Confirm the target application is compatible with the current production D1 schema and data.
4. Obtain explicit owner approval for the production switch.
5. Invoke Cloudflare's Pages deployment rollback endpoint for the verified previous production deployment:
   `POST /accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback`.
6. Wait for Cloudflare to report the rollback deployment complete; re-read project latest deployment and aliases.
7. Run read-only smoke checks for the apex and www routes, all three locale routes, static assets, and the Cloudflare Access challenge on `/admin/` and `/api/admin/v1/session`. Do not create or modify editorial records during rollback verification.
8. Record the resulting deployment ID, commit, status, smoke evidence and D1 compatibility decision.

### Current disposition

P8.10b remains open. No production rollback was performed because it changes the live deployment pointer and requires explicit owner approval. The read-only preflight confirms a previous successful production deployment is available, but does not itself prove rollback execution or post-rollback behavior.
