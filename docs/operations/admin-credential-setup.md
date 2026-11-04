# Admin Credential Setup

**Status:** Not applicable to the current implementation. No admin login or CMS credential exists in the application.

## Current state

The inspected repository has no \`/admin/\` route, \`/api/admin/*\` endpoint, Pages Functions, Cloudflare Access application configuration, server-side JWT validation code or CMS GitHub credential. There is no admin username, password, owner email or API token to configure for the website.

The only application deployment credential is \`CLOUDFLARE_API_TOKEN\`, which is used by GitHub Actions to deploy static assets. It is not an admin login credential. See [GitHub token setup](github-token-setup.md).

## Before admin credentials can be configured

Wait for the approved Agent 0 architecture, API and content contracts and the merged Agent 4/5 implementation. Then verify the actual code and Cloudflare configuration before documenting setup.

The future setup process must:

1. Identify the authorized owner identity from the owner through a secure configuration process. Do not guess or invent an email address.
2. Configure Cloudflare Access for the approved admin paths.
3. Confirm the backend validates the Access JWT signature, issuer, audience and expiration server-side.
4. Configure only the secret names required by the merged implementation.
5. Store secrets in the approved secret manager or GitHub Actions/Cloudflare secret store, not in Git.
6. Verify unauthorized requests fail even when the frontend is bypassed.
7. Verify authorized users can access only the intended administrative functions.
8. Record rotation and recovery procedures without recording secret values.

## Placeholder policy

When the implementation defines secret names, document names only, for example \`<FUTURE_ADMIN_SECRET_NAME>\`. Do not create or publish credentials in this document. Never paste passwords, JWT signing material, private keys or access tokens into chat, Markdown, source code or logs.

## Owner action today

No admin credential setup is required or possible for the current static website. Use the GitHub-based publishing workflow described in [Administrator User Guide](../implementation/admin-user-guide.md).
