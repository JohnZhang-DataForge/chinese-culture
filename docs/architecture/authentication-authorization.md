# Authentication and Authorization

**Current status:** No public-site user authentication or admin authorization is implemented.

## Current security boundary

The public website is static. The inspected repository has no user accounts, login form, admin route, Pages Functions API, JWT verifier, session cookie, application role model or authorization middleware.

The production deployment workflow uses a protected GitHub Actions repository secret named \`CLOUDFLARE_API_TOKEN\` to authenticate Wrangler to Cloudflare. This is deployment automation, not an admin credential. The workflow also uses GitHub's automatically provided \`GITHUB_TOKEN\`; no personal access token is required by the current site workflow.

## Requested future admin controls

The Agent 5 task brief calls for Cloudflare Access protection of \`/admin/*\` and \`/api/admin/*\`, with server-side validation of the Access JWT signature, issuer, audience and expiration. These controls are not present in the inspected \`main\` source. The final policy and token claims must be defined by Agent 0's approved contracts and the actual Cloudflare Access configuration.

~~~mermaid
flowchart TD
  A[Admin browser] --> B[Cloudflare Access policy]
  B --> C[Pages Function API]
  C --> D[Server-side JWT validation]
  D --> E[Authorization decision]
  E --> F[Allowed GitHub operation]
  E --> G[Reject unauthorized request]
~~~

This diagram is a target-state illustration only.

## Security requirements before an admin release

- Define the exact owner identity through an approved configuration process; never guess or hard-code an email address.
- Protect both the admin UI and every write API.
- Validate JWT signature against trusted key material and validate issuer, audience and expiration.
- Enforce authorization on the server for every read/write operation that requires it; never trust a hidden button or frontend state.
- Keep GitHub credentials server-side and grant only the minimum required repository permissions.
- Do not expose tokens in HTML, JavaScript bundles, logs or error responses.
- Add audit events for content mutations without logging credentials or unnecessary personal data.
- Test expired, malformed, wrong-audience and unauthorized tokens.

## Credential inventory today

| Name | Purpose | Status |
|---|---|---|
| \`CLOUDFLARE_API_TOKEN\` | GitHub Actions → Cloudflare Pages deployment | Required by deployment workflow; stored as GitHub Actions secret |
| \`GITHUB_TOKEN\` | GitHub Actions workflow access | Automatically provided by GitHub Actions |
| Admin Access identity/secret | Browser CMS authentication | Not configured by this application |
| CMS GitHub App/PAT credential | Future CMS GitHub API access | Not implemented; no secret name is approved |

See [admin credential setup](../operations/admin-credential-setup.md) and [security operations](../operations/security-operations.md).
