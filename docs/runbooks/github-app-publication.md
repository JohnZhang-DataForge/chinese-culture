# GitHub App Setup for CMS Publication and Media

The CMS uses a repository-scoped GitHub App. The browser never receives a GitHub token, and the Pages Function creates short-lived installation tokens for each operation.

## Create the app

In the `JohnZhang-DataForge` organization:

1. Open **Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Name it `Chinese Culture CMS Publisher`.
3. Set the homepage URL to `https://chinese-culture.site`.
4. Disable the webhook; this implementation polls PR state from the authenticated admin workspace.
5. Under **Repository permissions**, grant only:
   - **Contents: Read and write** — create CMS branches, write article snapshots and media assets.
   - **Pull requests: Read and write** — open reviewed publication/media PRs and inspect PR state.
   - **Checks: Read-only** — display CI checks in the admin workspace.
   - **Metadata: Read-only** — required repository metadata permission.
6. Do not grant Administration, Actions, Workflows, Secrets, Deployments or main-branch bypass permissions.
7. Select **Only select repositories** and install the app on `JohnZhang-DataForge/chinese-culture` only.
8. Generate a private key and download the PEM file.

## Configure Cloudflare Pages production secrets

Open Cloudflare Dashboard → Workers & Pages → `chinese-culture` → Settings → Variables and Secrets → Production.

Add:

| Variable | Type | Value |
|---|---|---|
| `GITHUB_APP_ID` | Plain text | App ID from GitHub App settings |
| `GITHUB_INSTALLATION_ID` | Plain text | Installation ID for the `chinese-culture` repository |
| `GITHUB_APP_PRIVATE_KEY` | Secret | Full PEM private key, including BEGIN/END lines |

Do not paste the private key into Git, an issue, a PR, a chat message or `.dev.vars`. Keep the downloaded PEM file in a secure password manager or secrets vault.

The admin session endpoint detects these three values at runtime. Once they are configured, the Admin UI enables publication and media upload without requiring a new website build.

## Expected workflow

- **Save draft:** writes to D1 only.
- **Preview:** renders a safe server-side preview; it does not write to GitHub.
- **Upload media:** creates a GitHub branch and a media-only PR. D1 attaches the media record only after that PR merges.
- **Request review:** creates a non-public review snapshot under `content-reviews/`.
- **Request publish:** creates a PR that adds or updates the locale-specific Markdown article.
- **Request unpublish:** creates a PR that removes the locale-specific Markdown article.
- **Merge:** remains a human action. The CMS never auto-merges or writes directly to `main`.
- **Sync:** when an admin session next checks the PR, a separate authenticated POST synchronizes the merged publication state into D1 and appends a revision.

## Validation checklist

- [ ] App is installed on the single `chinese-culture` repository.
- [ ] Contents, Pull requests and Checks permissions match the minimum list above.
- [ ] All three Pages production variables/secrets are present.
- [ ] Admin session reports `publish: true` and `mediaUpload: true`.
- [ ] A test media upload creates a media-only PR and does not update D1 until merge.
- [ ] A test publish PR updates the public static page only after merge and Pages deployment.
- [ ] D1 publication status synchronizes to `published` after the PR is merged.
