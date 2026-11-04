# Admin Credential Setup

**Status:** No production Admin CMS credential is configured by the current \`main\` application.

## Current state

The inspected \`main\` source has no production \`/admin/\` workflow, Admin API, Access JWT validation or GitHub App integration. Agent 4's open draft UI PR is mock-only in development; it is not a production CMS. Agent 5's backend branch is not merged and its Pages Functions runtime conflicts with Agent 0's Proposed separate Worker architecture.

The current deployment credential \`CLOUDFLARE_API_TOKEN\` is for GitHub Actions → Pages deployment. It is not an admin login.

## Proposed future security model

Agent 0 PR #3 proposes:

1. Cloudflare Access protects \`/admin/*\` and \`/api/admin/*\`.
2. A separate Worker serves \`/api/admin/v1/*\`.
3. The Worker verifies \`CF-Access-Jwt-Assertion\` signature against trusted Access signing keys.
4. The Worker checks issuer, audience, expiry, not-before, identity and configured role.
5. Mutations require exact Origin validation and short-lived \`X-CSRF-Token\`.
6. The Worker uses a short-lived GitHub App installation token stored server-side.

Proposed roles are \`admin\` and \`editor\`; public readers have no CMS API access. The owner identity must be supplied by the owner through a secure setup process. Do not guess or hard-code an email address.

## Future secret/configuration placeholders

Use the actual names approved by Agent 0/5 after the Worker implementation is reconciled. Until then, document only placeholders:

- \`<ACCESS_TEAM_DOMAIN>\`
- \`<ACCESS_APPLICATION_AUDIENCE>\`
- \`<AUTHORIZED_EDITOR_IDENTITIES>\`
- \`<GITHUB_APP_ID>\`
- \`<GITHUB_APP_INSTALLATION_ID>\`
- \`<GITHUB_APP_PRIVATE_KEY>\`
- \`<ADMIN_ORIGIN>\`

These are placeholders, not current repository variables or secrets. Never add values to Markdown, Git, HTML, client JavaScript or logs.

## Setup checklist after the Worker is accepted

1. Confirm Agent 0 has marked the OpenSpec and API/auth contracts Ready.
2. Deploy the separate Worker to an isolated test environment.
3. Configure Cloudflare Access applications/policies for the exact admin paths.
4. Confirm the Access audience and issuer against the live Access configuration.
5. Create/install the GitHub App only on the private site repository with least privilege.
6. Store App private key and installation configuration as Worker secrets.
7. Configure the owner/editor allowlist securely.
8. Test anonymous, invalid JWT, wrong audience, expired JWT and unauthorized identity requests.
9. Test CSRF and cross-origin mutation rejection.
10. Verify no token reaches browser bundles, responses or logs.
11. Document actual secret names and rotation steps without secret values.

## Owner action today

No Admin credential setup is required for the current static site. Use the GitHub publishing process in [Administrator User Guide](../implementation/admin-user-guide.md).
