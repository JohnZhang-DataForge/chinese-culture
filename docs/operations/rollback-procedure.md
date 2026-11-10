# Cloudflare Pages Rollback Procedure

**Current hosting:** Cloudflare Pages Direct Upload with static public output and Pages Functions.  
**Current status:** Production rollback has not yet been rehearsed. Actual rollback changes the live production deployment pointer and requires explicit owner approval.

## When to consider rollback

Use rollback for a release that causes a material production regression such as broken locale routes, missing assets, Admin shell failures or a severe public rendering issue. For a factual/content correction, a small reviewed fix may be safer than reverting the entire site.

## Preflight

1. Open Cloudflare Dashboard → Workers & Pages → chinese-culture → Deployments.
2. Record the current production deployment ID, source commit SHA and timestamp.
3. Identify the previous known-good production deployment and verify its source commit.
4. Confirm the intended target includes compatible static assets and Pages Functions.
5. Confirm the owner has explicitly approved changing the production deployment pointer.

## Rollback

1. Select the verified previous production deployment.
2. Use the Pages deployment rollback/revert action in the dashboard.
3. Wait for Cloudflare to complete the operation.
4. Read back the latest production deployment ID and source commit.
5. Verify the production domain and Pages hostname.
6. Smoke-test English, Simplified Chinese and Spanish home, section and article routes.
7. Verify static assets, sitemap, localized 404 and www → apex redirect.
8. Verify /admin/ and /api/admin/v1/session remain protected by Cloudflare Access.

## Git revert alternative

If the deployment history does not provide a suitable prior deployment:
1. Create a branch from current main.
2. Revert the faulty commit with a normal Git revert.
3. Open a PR and wait for CI.
4. Merge after review.
5. Verify the new Pages deployment and source SHA.

Do not force-push or rewrite shared Main history for routine rollback.

## Data boundary

Pages rollback does not roll back D1. Do not restore or mutate D1 as part of a static-site rollback unless a separate database incident is confirmed and an approved D1 recovery procedure is followed. The CMS GitHub App publication integration remains pending.

## Evidence to record

Record the initiating incident, current and target deployment IDs, source SHAs, approval, rollback timestamp, smoke-test results and any follow-up PR. The rollback rehearsal remains open in [OpenSpec tasks](../openspec/changes/bilingual-admin-cms/tasks.md).

Official reference: [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).
