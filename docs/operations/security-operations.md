# Security Operations

**Status:** Static-site baseline implemented; formal security review and future CMS controls remain outstanding.

## Current application security boundary

The deployed public site is static. The inspected source contains no login, user accounts, CMS, API endpoint, Pages Functions, database or visitor-submitted data flow.

The current privacy page says the application does not intentionally set cookies and does not include visitor accounts, newsletter subscriptions, contact forms or integrated analytics. The hosting provider may process ordinary request information for security and delivery.

## Implemented response headers

\`public/_headers\` currently configures:

- \`X-Content-Type-Options: nosniff\`
- \`Referrer-Policy: strict-origin-when-cross-origin\`
- \`X-Frame-Options: DENY\`
- \`Permissions-Policy: camera=(), microphone=(), geolocation=()\`

The current file does not configure a Content-Security-Policy or Strict-Transport-Security header. Do not claim either is enabled without verifying the deployed response.

## Credential handling

- Keep \`CLOUDFLARE_API_TOKEN\` in GitHub Actions repository secrets.
- Use the least-privilege Pages Write scope.
- Use the built-in \`GITHUB_TOKEN\` rather than creating a PAT for the current workflow.
- Never commit secrets, \`.env\` files, access tokens or private keys.
- Avoid logging secret values; rotate and revoke any exposed token.

## Repository and release controls

- Keep the source repository private.
- Use feature branches and pull requests.
- Require CI to pass before merging.
- Review content links, images, licenses and metadata.
- Confirm the Pages deployment source SHA after merging.
- Do not copy private project notes into public \`dist/\` assets.

## Known gaps

- No formal security penetration test is recorded.
- No formal accessibility audit is recorded.
- No application Content-Security-Policy or HSTS is configured in the checked \`_headers\` file.
- No admin authentication exists because the CMS is not implemented.
- No audit trail for browser-based content mutations exists.
- The \`www\` custom-domain validation is pending.

## Before enabling an admin CMS

Require a reviewed threat model, Cloudflare Access policy, server-side JWT validation, authorization checks on every write, least-privilege GitHub credentials, input/schema validation, rate limiting, audit logging, safe error handling and tests that bypass the frontend. The final controls must match Agent 0's approved contract and the merged Agent 5 implementation.

## Incident response

If a deployment token is suspected to be exposed, rotate it immediately, update the GitHub secret, verify a new deployment and revoke the old token. For other incidents, follow [incident recovery](incident-recovery.md).
