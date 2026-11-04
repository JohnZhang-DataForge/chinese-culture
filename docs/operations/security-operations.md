# Security Operations

**Status:** Static-site baseline implemented; CMS controls are proposed and not yet deployed.

## Current application boundary

The current production site is static. The inspected main branch has no login, user accounts, CMS, API endpoint, Pages Functions, separate Admin Worker, database or visitor-submitted data flow.

The current privacy page says the application does not intentionally set cookies and does not include visitor accounts, newsletter subscriptions, contact forms or integrated analytics. Cloudflare may process ordinary request information for security and delivery.

## Implemented response headers

\`public/_headers\` currently configures:

- \`X-Content-Type-Options: nosniff\`
- \`Referrer-Policy: strict-origin-when-cross-origin\`
- \`X-Frame-Options: DENY\`
- \`Permissions-Policy: camera=(), microphone=(), geolocation=()\`

The checked file does not configure a Content-Security-Policy or Strict-Transport-Security header. Verify deployed response headers before making any stronger claim.

## Current credential handling

- Keep \`CLOUDFLARE_API_TOKEN\` in GitHub Actions repository secrets.
- Use only the Pages Write permission needed by the deployment workflow.
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

Main branch protection was reported as not enabled in Agent 0's baseline inspection. Confirm the live GitHub branch-protection settings and enable required PR/check policies before the CMS publishing workflow is accepted.

## Proposed CMS security model

Agent 0 PR #3 proposes Cloudflare Access plus a separate Worker:

- Access protects \`/admin/*\` and \`/api/admin/*\`.
- Worker independently verifies Access JWT signature, issuer, audience, expiry and identity.
- Server-side role mapping grants only approved admin/editor identities.
- Mutations require exact Origin and CSRF validation.
- A least-privilege GitHub App is used server-side.
- The Worker writes CMS branches and opens PRs; it cannot merge or write directly to \`main\`.
- API errors use RFC 9457 Problem Details.
- Audit logs record action and identifiers without secrets or full sensitive payloads.

This is a Proposed target, not an implemented production control.

## Integration risks

Agent 5's backend branch currently adds Pages Functions middleware, while Agent 0 proposes a separate Worker. Resolve the runtime architecture before accepting backend security claims. Agent 4's draft UI mock mode is not authentication. Do not expose the admin path until Access and backend authorization are actually configured.

## Known gaps

- No formal penetration test is recorded.
- No formal accessibility audit is recorded.
- No application CSP or HSTS is configured in the checked \`_headers\` file.
- No production admin authentication exists in main.
- No audit trail for browser-based content mutations exists.
- External HTTP/TLS smoke testing for the custom domain is still outstanding.

## Incident response

If the deployment token is suspected to be exposed, rotate it, update the GitHub secret, verify a new deployment and revoke the old token. For other incidents, follow [incident recovery](incident-recovery.md).
