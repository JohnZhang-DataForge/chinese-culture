# Rollback Procedure

**Current hosting:** Cloudflare Pages Free, Direct Upload.  
**Current CMS state:** No production Admin Worker is deployed.

## When to roll back

Rollback when a production release causes broken routes, missing assets, severe rendering problems or another material regression. For a factual/content issue, determine whether a correction or full deployment rollback is safer.

## Pages rollback

Cloudflare Pages supports reverting a project to a previous production deployment.

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Select the **chinese-culture** Pages project.
4. Open **Deployments**.
5. Find the last-known-good production deployment by commit SHA and time.
6. Use the deployment actions to roll back to that deployment.
7. Wait for the rollback to complete.
8. Verify the Pages production deployment record.
9. Test apex HTTPS, representative routes, assets, 404 and canonical redirects.
10. Record the selected deployment ID, source SHA, time and verification results.

At the first verified production snapshot, only one production deployment was recorded. If there is no earlier known-good deployment, use a reviewed Git revert.

Official reference: [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

## Git revert fallback

1. Identify the faulty commit and last-known-good source.
2. Create a branch from current \`main\`.
3. Run \`git revert <bad-commit-sha>\` for a single commit, or carefully revert the required commit range.
4. Open a PR and wait for CI.
5. Merge after review.
6. The main-branch workflow publishes the reverted source.
7. Verify the new deployment and record its SHA.

Do not force-push or rewrite shared main history as a routine rollback.

## Domain/DNS rollback

Agent 1's cutover created only two proxied CNAME records and one zone redirect ruleset with two rules. If a domain change causes an outage:

1. Read the current Pages domain and DNS state.
2. Identify the exact failing hostname and rule.
3. Preserve Pages custom-domain associations unless the infrastructure owner approves removal.
4. Disable or adjust only the specific faulty redirect rule if evidence shows it is responsible.
5. Do not delete unrelated DNS records or change nameservers as a first response.
6. Re-check Pages validation and Universal SSL status.
7. Run external DNS, HTTP and TLS tests.
8. Record the change in [Domain DNS Change Log](domain-dns-change-log.md).

Both redirect rules exclude the Pages ACME path; preserve this exclusion during any rollback or edit.

## Future Admin Worker rollback

When a separate Admin Worker is deployed, record each production Worker version/deployment ID and test its rollback procedure separately from Pages. Do not assume rolling back Pages also rolls back the Worker. The current main has no production Admin Worker.

## Post-rollback

Confirm the public version, route availability, CSS, favicon, headers, 404, HTTPS and redirect behavior. Keep faulty commits and incident evidence in Git history. Open a follow-up fix PR rather than immediately redeploying the same faulty change.
