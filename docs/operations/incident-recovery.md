# Incident Recovery

This runbook covers the current static website and Pages deployment. It does not assume a production CMS or database exists.

## 1. Website unavailable

1. Check the Cloudflare Pages project and latest production deployment.
2. Check the existing \`pages.dev\` hostname.
3. If Pages is healthy but a custom domain fails, inspect zone status, DNS CNAMEs, Pages custom-domain status, Universal SSL and redirect rules.
4. Determine whether the failure affects apex, www or both.
5. Do not delete the Pages project or replace nameservers as a first response.
6. If the active deployment is faulty, follow [rollback procedure](rollback-procedure.md).

## 2. GitHub deployment workflow fails

1. Open the failed run in GitHub Actions.
2. Identify the failing step: checkout, Node setup, npm install, Astro build, static verification, token preflight or Wrangler upload.
3. For build failures, reproduce with \`npm install\`, \`npm run build\` and \`npm run verify\`.
4. For token failures, confirm the repository secret is named \`CLOUDFLARE_API_TOKEN\` and is valid.
5. Never print the secret value.
6. Fix source or credential configuration through an approved change and rerun.

## 3. Apex or WWW HTTPS/redirect issue

The latest Cloudflare API state reports both Pages custom domains active, both HTTP validations active, and the Universal SSL certificate pack active for apex and wildcard.

The redirect ruleset contains:
- WWW → HTTPS apex, 301, preserving path/query.
- Apex HTTP → HTTPS apex, 301, preserving path/query.
- Both rules exclude \`/.well-known/acme-challenge/*\`.

Cloudflare configuration does not replace an external smoke test. Use a normal workstation to check DNS resolution, TLS handshake, HTTP status and the complete redirect chain. If a redirect rule is suspected, inspect the exact expression before changing it.

## 4. Static content or route missing

1. Confirm the source file exists in the expected current collection.
2. Confirm required frontmatter is valid.
3. Run \`npm run build\` and \`npm run verify\`.
4. Check the generated \`dist/\` route.
5. Confirm the content change was merged to \`main\`.
6. Confirm the production deployment references that commit.
7. If a published slug was renamed, add an approved redirect.

## 5. Suspected credential exposure

1. Treat the token as compromised.
2. Create a replacement least-privilege Cloudflare Pages token.
3. Update the repository Actions secret.
4. Verify a controlled deployment.
5. Revoke the exposed token.
6. Review workflow logs and repository history for accidental disclosure.
7. Record the incident without including secret values.

For future CMS credentials, use the accepted Worker secret rotation procedure. Do not copy Access JWTs or GitHub App private keys into evidence.

## 6. Future CMS/Worker outage

The proposed CMS uses a separate Worker. If deployed, public static pages should remain readable when the Worker is unavailable. During a Worker incident, disable/rollback only the Worker route/version as needed; do not take down public Pages as a first response. This behavior must be verified after the Worker is deployed.

## 7. Data recovery

The current site has no application database or runtime CMS content store. Recover Markdown, Astro source and static assets from Git history or a trusted repository backup. See [backup and recovery](backup-and-recovery.md).

## Evidence

Record UTC timestamps, affected hostnames, Pages deployment ID, source SHA, workflow run URL, Cloudflare status and actions taken. Redact tokens, personal data and sensitive request headers.
