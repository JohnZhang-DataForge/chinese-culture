# Admin Credential and Access Setup

**Status:** Cloudflare Access and Admin runtime configuration are deployed. GitHub App publication credentials are not configured. This guide records the boundaries; it does not contain secret values.

## Current production authentication

- Cloudflare Access protects /admin/* and /api/admin/*.
- The Access allow policy is restricted to the designated administrator identity.
- Pages Functions validate the Access JWT and configured administrator identity/role.
- Mutating API calls require same-origin validation and an identity-bound CSRF token.
- ADMIN_CSRF_SECRET is a Pages secret; its value must never be written to this file or exposed to the browser.
- The public website has no visitor account or public login system.

If the authorized administrator cannot access Admin, inspect the Cloudflare Access application and allow policy in the dashboard. Do not disable Access or expose the Admin API publicly as a workaround.

## Deployment credential is not an Admin credential

CLOUDFLARE_API_TOKEN is used by GitHub Actions to deploy the Pages project. It is not an Admin login and must not be entered into the browser or shared with content editors.

## GitHub App setup still required

The CMS publication/media workflow requires a repository-scoped GitHub App installed only on JohnZhang-DataForge/chinese-culture, with minimum permissions documented in [GitHub App publication setup](../runbooks/github-app-publication.md).

The following production Pages settings are currently absent:
- GITHUB_APP_ID
- GITHUB_INSTALLATION_ID
- GITHUB_APP_PRIVATE_KEY

No secret values were read or recorded. The owner must create/install the App and configure these settings securely before publish/unpublish and media PR workflows can be accepted.

## Rotation and recovery

- Rotate Cloudflare Access or CSRF secrets only through the Cloudflare dashboard and coordinated deployment process.
- Rotate GitHub App private keys using the GitHub App settings and update the Pages secret securely.
- After any rotation, run authenticated Admin smoke tests and verify unauthorized requests still fail closed.
- Never paste tokens, private keys, session cookies, JWTs or CSRF values into issues, PRs, logs or ChatGPT.
