# Cloudflare Cost and Limit Monitoring

**Updated:** 2026-11-10  
**Project:** `chinese-culture`  
**Hosting:** Cloudflare Pages Free, Direct Upload  
**Data store:** One production Cloudflare D1 database (`chinese-culture-cms`)

## Cost posture

The public website is static-first. Ordinary page views use Pages static assets and do not invoke Pages Functions or query D1. The Admin API is the only routine D1 consumer. Preview deployments use a separate Wrangler configuration with no D1 binding and no production secrets.

This keeps the normal reader path free of runtime database and function usage. Static asset requests are free and unlimited on Pages; Pages Functions requests count against the Workers plan request quota. D1 has scale-to-zero compute and no data-transfer/egress charge; usage is measured by rows read, rows written and stored data.

## Current Workers Free limits

These are published account-plan limits, not a measurement of current account usage.

| Resource | Workers Free limit | Operational impact |
|---|---:|---|
| Workers / Pages Functions requests | 100,000 per day | Shared account quota; Pages Function requests count |
| Worker CPU time | 10 ms per invocation | Keep Admin handlers small and bounded |
| Worker subrequests | 50 per invocation | Avoid fan-out and repeated GitHub/D1 calls |
| D1 rows read | 5 million per day | Exceeding the daily limit blocks D1 queries until reset |
| D1 rows written | 100,000 per day | Exceeding the daily limit blocks D1 writes until reset |
| D1 maximum database size | 500 MB per database | Writes/schema changes stop when the limit is reached |
| D1 total account storage | 5 GB | Shared across account databases |
| D1 databases | 10 per account | Avoid creating per-PR or per-developer databases |
| D1 Time Travel | 7 days | Not a substitute for durable SQL export/restore |

Daily D1 row limits reset at midnight UTC. When a free-tier daily read/write limit is exceeded, D1 queries fail until reset; stored data is not deleted. Cloudflare sends email alerts when a daily D1 limit is reached.

Official references:
- [D1 pricing and included usage](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 platform limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)

## Monitoring locations

1. **D1 row usage:** Cloudflare Dashboard → Workers & Pages → D1 → `chinese-culture-cms` → Metrics → Row Metrics. Review rows read, rows written and storage.
2. **Functions requests:** Cloudflare Dashboard → Workers & Pages → Workers & Pages Analytics for the Pages project/Functions. Distinguish static asset traffic from `/api/admin/*` invocations.
3. **D1 storage:** review the database size and account storage before schema changes, imports or restore rehearsals.
4. **Pages deployment health:** inspect the latest production deployment and the GitHub Actions deployment run. Do not treat a successful upload alone as proof of Admin CRUD.
5. **GitHub Actions:** review CI, preview and production deploy runs. Preview deploys are same-repository PR only and use no D1 or production credentials.

No live account usage counters were queried while writing this runbook. The table above records the published limits only; do not interpret it as current consumption.

## Operational guardrails

- Keep one production D1 database. Do not create a D1 database for each PR or preview.
- Never bind production `CMS_DB` to a preview deployment.
- Keep `wrangler.preview.jsonc` free of D1 bindings, production variables and secrets.
- Keep the public website static. Do not add public-page D1 queries or Pages Function invocations.
- Use bounded pagination and indexed filters in Admin list endpoints.
- Avoid unbounded `SELECT *`, full-table scans and repeated list reloads.
- Keep GitHub App tokens short-lived and server-side. GitHub API calls are not a substitute for D1 reads.
- Keep media in the existing Git-backed workflow; do not introduce R2 or another paid storage service without an approved design/cost review.
- Keep production D1 migrations/import isolated to the dedicated bootstrap workflow. Automated CI and preview tests use local D1 or no D1.
- Keep SQL export/restore tests isolated from production. Time Travel is short-window recovery, not a durable backup.
- Preserve the static asset-only public reader path; normal readers should not consume the Workers Functions request quota.

## Review thresholds and response

Use these internal review thresholds as operational triggers, not Cloudflare-enforced alerts:

| Metric | Review | Action |
|---|---:|---|
| Workers/Pages Functions requests | 50% of daily limit | Check whether public traffic is invoking Functions unexpectedly |
| D1 rows read | 50% of daily limit | Inspect high-read endpoints and query plans/indexes |
| D1 rows written | 50% of daily limit | Inspect repeated writes, retries and revision churn |
| Any free-tier metric | 80% of daily limit | Investigate before further bulk operations/imports |
| D1 storage | 70% of 500 MB | Inspect revision growth and media metadata; do not delete history without approval |
| Pages static files | 70% of 20,000 | Review generated assets and image duplication |

If a D1 daily limit is reached:
1. Stop bulk imports and nonessential Admin writes.
2. Check Cloudflare D1 Row Metrics and identify the endpoint/query responsible.
3. Reduce full scans, add/adjust indexes through a reviewed migration, and bound query results.
4. Wait for the midnight UTC reset or present measured evidence before proposing a Workers Paid upgrade.
5. Do not delete content or revision history as an emergency cost workaround.

## Upgrade decision

Do not upgrade the Cloudflare plan pre-emptively. Consider Workers Paid only if measured production use repeatedly approaches the free daily limits after query optimization, or if a required feature exceeds a free-tier limit. Preserve the static-first architecture either way; a paid plan does not justify adding runtime work to public page views.
