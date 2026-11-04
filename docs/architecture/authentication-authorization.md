# Authentication and Authorization

**Current status:** No production admin authentication in \`main\`.  
**Target:** Cloudflare Access + separate Worker verification, as proposed in Agent 0 PR #3.

## Current security boundary

The public website is static. The inspected main branch has no login, user accounts, admin route, API, Pages Functions, separate Worker, JWT verifier, session cookie or application role model.

The deployment workflow uses GitHub Actions secret \`CLOUDFLARE_API_TOKEN\` to authenticate Wrangler to Cloudflare. This is a deployment credential, not an admin credential. GitHub Actions supplies its own \`GITHUB_TOKEN\`.

## Proposed authentication flow

1. Cloudflare Access protects \`/admin/*\` and \`/api/admin/*\`.
2. The browser calls the same-origin Admin API under \`/api/admin/v1/*\`.
3. Cloudflare Access injects \`CF-Access-Jwt-Assertion\`.
4. The separate Worker independently verifies the JWT signature against Access signing keys.
5. The Worker checks issuer, audience, signature, expiration, not-before, identity and configured role.
6. Mutations require exact Origin validation and a short-lived \`X-CSRF-Token\` returned by \`GET /session\`.
7. The Worker uses a server-side GitHub App installation token to perform approved Git operations.

The browser must never supply or store a GitHub App private key or installation token.

## Proposed roles

| Role | Proposed permissions |
|---|---|
| \`admin\` | All CMS operations, including submitting publish/unpublish PRs |
| \`editor\` | Create/edit/translate/preview/upload and submit review PRs |
| Public reader | Public site only; no CMS API access |

The exact owner identity and allowlist must be supplied by the owner through a secure configuration process. Do not invent an email address.

## Proposed GitHub App permissions

- Metadata: read.
- Contents: read/write.
- Pull requests: read/write.
- Checks/statuses: read only if needed to display PR status.

No repository administration, Actions administration, workflow write or secrets write permission is needed for editorial content management.

## Contract readiness and implementation conflict

Agent 0's design and OpenAPI are still Proposed in open PR #3. Agent 5's current branch contains Pages Functions middleware and JWT helper code, while Agent 0's proposed target requires a separately deployed Worker. Reconcile this architectural conflict before merging backend code or treating its authentication implementation as production.

## Credential inventory

| Credential | Current state |
|---|---|
| \`CLOUDFLARE_API_TOKEN\` | Used by GitHub Actions for Pages deployment |
| GitHub Actions \`GITHUB_TOKEN\` | Automatically provided by GitHub |
| Cloudflare Access team/audience configuration | Future admin configuration; not verified as an application integration |
| GitHub App ID/installation/private key | Future Worker configuration; no production CMS integration in main |

See [admin credential setup](../operations/admin-credential-setup.md) and [security operations](../operations/security-operations.md).
