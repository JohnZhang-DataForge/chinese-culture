# GitHub and Deployment Token Setup

## Credential inventory today

| Credential | Source | Current purpose |
|---|---|---|
| `GITHUB_TOKEN` | Automatically supplied by GitHub Actions | Workflow access; no manually created PAT required |
| `CLOUDFLARE_API_TOKEN` | Cloudflare token stored as a repository Actions secret | Wrangler Direct Upload to Pages |
| GitHub App installation token | Not configured in current main | Proposed future Admin Worker access |
| GitHub App private key | Not configured in current main | Proposed future Admin Worker credential |

## Configure the current Cloudflare deployment secret

The production Pages deployment workflow requires repository Actions secret `CLOUDFLARE_API_TOKEN`.

1. In Cloudflare Dashboard, open account API token management.
2. Create a token with only the Pages Write permission needed for this account/project.
3. Do not grant DNS, Zone, Workers, account administration or unrelated permissions to the Pages deployment token.
4. Copy the token directly to a secure password manager. Cloudflare displays it only once.
5. In GitHub, open the private repository **Settings → Secrets and variables → Actions**.
6. Create or update the repository secret named exactly `CLOUDFLARE_API_TOKEN`.
7. Paste the value directly into the secret field and save it.
8. Never paste the token into source control, workflow YAML, Markdown, an issue, a pull request or chat.

The workflow contains the non-secret Cloudflare account ID directly in YAML.

## Verify without revealing the token

1. Open the repository Actions tab.
2. Run the Pages deployment workflow on `main` or merge an approved change.
3. Confirm the token preflight and Wrangler upload steps succeed.
4. If it fails, check the secret name, scope and validity without printing its value.

A successful deployment on 2026-11-04 confirms that the current workflow could authenticate and upload the Pages site. It does not expose the token value.

## Proposed CMS GitHub App

Agent 0's Proposed architecture uses a GitHub App installed only on `JohnZhang-DataForge/chinese-culture`. Minimum permissions:

- Metadata: read.
- Contents: read/write.
- Pull requests: read/write.
- Checks/statuses: read only if needed to display PR checks.

The App ID, installation ID and private key are stored as secrets in the **separate Admin Worker**, not in the browser or Pages static assets. The Worker obtains short-lived installation tokens and writes only to `cms/<contentId>/<locale>` branches before creating/updating PRs.

No App secret names or values are approved in the current implementation. Use placeholders until Agent 0/5 freeze the Worker configuration. Do not create a personal access token as a substitute.

## Rotation and revocation

If a token is exposed or no longer needed:

1. Create a replacement least-privilege Cloudflare Pages token.
2. Update the GitHub Actions secret.
3. Run a controlled deployment.
4. Revoke the old token.
5. Record date and reason without recording either value.

Future GitHub App key rotation must follow the accepted Worker operations guide.
