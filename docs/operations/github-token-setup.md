# GitHub and Deployment Token Setup

## Credential inventory today

| Credential | Where it comes from | Current purpose |
|---|---|---|
| \`GITHUB_TOKEN\` | Automatically supplied by GitHub Actions | Workflow access; no manually created PAT required |
| \`CLOUDFLARE_API_TOKEN\` | Cloudflare account API token stored as a repository Actions secret | Wrangler Direct Upload to Cloudflare Pages |
| CMS GitHub App/PAT credential | Not implemented | No current CMS GitHub API write integration |

## Configure the Cloudflare deployment secret

The production deployment workflow requires the repository secret \`CLOUDFLARE_API_TOKEN\`.

1. In Cloudflare Dashboard, open account API token management.
2. Create a token with only the Pages Write permission required for the \`chinese-culture\` Pages project/account.
3. Do not grant DNS, Zone, Workers or unrelated permissions for this deployment workflow.
4. Copy the token directly to a secure password manager. Cloudflare displays it only once.
5. In GitHub, open the private repository **Settings → Secrets and variables → Actions**.
6. Create or update the repository secret named exactly \`CLOUDFLARE_API_TOKEN\`.
7. Paste the value directly into the secret field and save it.
8. Do not paste the token into a GitHub variable, Markdown file, workflow YAML, issue, pull request or chat.

The deployment workflow contains the non-secret Cloudflare account ID directly in \`.github/workflows/pages-deploy.yml\`. Do not create an additional account-ID secret for the workflow unless the workflow is deliberately changed.

## Verify without revealing the token

1. Open the repository Actions tab.
2. Run the deployment workflow on \`main\` or merge an approved change.
3. Confirm the token preflight and Wrangler deployment steps succeed.
4. If it fails, inspect the error message and secret name; do not print the secret value.

A successful deployment run on 2026-11-04 confirms the current workflow was able to authenticate and upload the Pages site. This does not expose or validate the token value outside that workflow.

## Rotation and revocation

If the token is exposed or no longer needed:

1. Create a replacement least-privilege token in Cloudflare.
2. Update the GitHub Actions secret with the new value.
3. Run a controlled deployment to verify the replacement.
4. Revoke the old token in Cloudflare.
5. Record the rotation date and reason here without recording either value.

## Do not create a personal access token for the current site

The current static publishing flow does not need a GitHub PAT. GitHub Actions supplies \`GITHUB_TOKEN\`. A future CMS GitHub App or fine-grained token must be designed and approved separately, with repository-scoped permissions and a server-side storage location.
