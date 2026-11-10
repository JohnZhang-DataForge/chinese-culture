# Maintenance, Reliability and Measurement

**Status:** Operational guidance for the deployed multilingual site and D1-backed Admin · **Updated:** 2026-11-11

## Each release

- Confirm PR checks pass before merge.
- After merge, verify Main CI and the Pages deployment independently.
- Confirm Cloudflare's latest production deployment references the expected Main SHA.
- Smoke-test English, Simplified Chinese and Spanish home, section and article routes.
- Verify Admin remains protected by Cloudflare Access and unauthenticated API requests fail closed.
- Review deployment logs for failed steps; do not infer production success from CI alone.

## Weekly

- Review open PRs and GitHub Actions failures.
- Check outbound educational links and reported content corrections.
- Review Cloudflare Pages deployment status and D1 backup/recovery readiness.
- Check that public event pages remain honest and do not show expired or unverified listings.

## Monthly

- Review Cloudflare usage and current Free/Paid limits for Pages, Workers Functions and D1.
- Review D1 backup/recovery evidence and test restore procedure in a disposable database.
- Review administrator access allowlist and repository permissions.
- Review article freshness, locale completeness, accessibility issues and reader feedback.

## Quarterly

- Review content terminology and cultural accuracy, especially translated articles.
- Recheck external source links and image rights/attribution.
- Review repository main-branch protection, GitHub App permissions and secret rotation.
- Reassess whether new features justify additional runtime, data collection or spend.

## Incident response

1. Identify whether the issue affects public static pages, Admin, Pages Functions, D1 or GitHub publication.
2. Stop risky publication actions; do not delete the Pages project or database as an initial response.
3. If a release caused a public regression, compare the current and previous successful deployments and use the approved rollback procedure.
4. Preserve relevant run IDs, commit SHA and evidence; never copy secrets into incident notes.
5. Correct source and tests, deploy through normal CI and record the incident outcome.

## Measurement policy

Prefer aggregate, privacy-conscious operational data. Do not introduce persistent visitor profiling or IP-level analytics without an approved privacy review. Distinguish hosting/security logs from application analytics.
