# Rollback Procedure

**Current hosting:** Cloudflare Pages Free, Direct Upload.  
**Important:** The production deployment history contained one successful production deployment at the last verified snapshot. A previous production rollback target may therefore not yet exist.

## When to roll back

Rollback when a production release causes a broken route, missing assets, severe rendering problems or another material regression. For a factual/content issue, determine whether a correction or a full deployment rollback is safer.

## Preferred: Cloudflare Pages deployment rollback

Cloudflare Pages supports reverting a project to a previous production deployment.

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Select the **chinese-culture** Pages project.
4. Open **Deployments**.
5. Find the last-known-good production deployment by commit SHA and deployment time.
6. Use the deployment actions to roll back to that deployment.
7. Wait for the rollback operation to complete.
8. Verify the Pages production deployment record and test the site over HTTPS.
9. Record the incident, selected deployment ID, commit SHA, time and verification results in the change log.

Do not select a preview deployment as the production rollback target unless the owner has explicitly approved that choice.

Official reference: [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

## Alternative: revert the Git change

If the issue is caused by a recent source commit and a Pages rollback target is unavailable:

1. Identify the bad commit and the last-known-good commit.
2. Create a new branch from current \`main\`.
3. Use \`git revert <bad-commit-sha>\` for a normal single commit, or carefully revert the relevant commit range.
4. Open a pull request and let CI validate the revert.
5. Merge the revert after review.
6. The main-branch deployment workflow publishes the reverted source.
7. Verify the new deployment and record its SHA.

Do not force-push or rewrite shared \`main\` history as a routine rollback method.

## Alternative: redeploy a known-good commit

For an emergency when the current source cannot be reverted immediately, a maintainer may check out a verified last-known-good commit locally and run the documented Wrangler deployment command with authorized credentials. This requires a trusted environment and the Cloudflare token in environment variables; never place credentials in command-line history or chat. Prefer the Cloudflare Pages rollback or a reviewed Git revert.

## Post-rollback

- Confirm the production hostname serves the intended version.
- Check home, collection, detail, information and 404 routes.
- Check CSS, favicon, headers and redirects.
- Confirm the custom-domain state has not changed.
- Keep the faulty commit and incident evidence in Git history.
- Open a follow-up fix PR; do not immediately redeploy the same faulty change.
