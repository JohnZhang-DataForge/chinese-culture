# Incident Recovery

This runbook covers the current static website and Pages deployment. It does not assume a CMS or database exists.

## 1. Website unavailable

1. Check the Cloudflare Pages project and latest production deployment status.
2. Confirm whether the \`pages.dev\` hostname is reachable.
3. If Pages is healthy but a custom domain fails, inspect the zone status, DNS CNAME records, Pages custom-domain validation and redirect rules.
4. Check whether the failure affects only \`www\` or also the apex hostname.
5. Do not delete the Pages project or replace nameservers as a first response.
6. If the active deployment is faulty, follow [rollback procedure](rollback-procedure.md).

## 2. GitHub deployment workflow fails

1. Open the failed run in GitHub Actions.
2. Identify the failing step: checkout, Node setup, npm install, Astro build, static verification, token preflight or Wrangler upload.
3. For build failures, reproduce with \`npm install\`, \`npm run build\` and \`npm run verify\`.
4. For token failures, confirm the repository secret is named \`CLOUDFLARE_API_TOKEN\` and is not expired/revoked.
5. Never print the secret value in logs.
6. Fix the source or credential configuration through an approved change and rerun.

## 3. Apex domain works but WWW does not

The last verified configuration has:

- Apex Pages custom domain active.
- WWW Pages custom domain pending.
- Both CNAME records proxied to \`chinese-culture-79h.pages.dev\`.
- An enabled 301 redirect rule from \`www\` to the apex.

Pages uses HTTP validation. Cloudflare documents that redirects, Access, Workers or WAF rules can interfere with HTTP validation. Check the validation endpoint response and the redirect rule before changing DNS. Coordinate any temporary rule adjustment with the infrastructure owner.

## 4. Static content or route missing

1. Confirm the source file exists in the expected collection or page path.
2. Confirm required frontmatter is valid.
3. Run \`npm run build\` and \`npm run verify\`.
4. Check the generated \`dist/\` route.
5. Review whether the content file was merged to \`main\`.
6. Confirm the production deployment references that main commit.
7. If a published slug was renamed, add an approved redirect.

## 5. Suspected credential exposure

1. Treat the token as compromised.
2. Create a replacement least-privilege Cloudflare Pages token.
3. Update the repository Actions secret.
4. Verify a controlled deployment.
5. Revoke the exposed token.
6. Review workflow logs and repository history for accidental disclosure.
7. Record the incident without including secret values.

## 6. Data recovery

The current site has no application database or runtime CMS content store. Recover Markdown, Astro source and static assets from Git history or a trusted repository backup. See [backup and recovery](backup-and-recovery.md).

## Escalation and evidence

Record UTC timestamps, affected hostnames, Pages deployment ID, source SHA, workflow run URL, relevant Cloudflare status and actions taken. Redact tokens, personal data and sensitive request headers from evidence.
