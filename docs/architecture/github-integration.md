# GitHub Integration

**Status:** Git source control, CI and Pages deployment are implemented. CMS GitHub App publication setup remains pending.

## Repository model

- Repository: JohnZhang-DataForge/chinese-culture.
- Visibility: public (the owner changed visibility to restore GitHub Actions runner availability).
- Default branch: main.
- Main is the reviewed source for application code and generated public Markdown snapshots.
- A repository ruleset is not currently configured; required checks/no-bypass protection remains an owner action.

## Current workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| Validate Astro static website | Pull requests and Main pushes | Content validation, local D1 migration checks, unit tests, build, static verification and Admin browser tests |
| Deploy Chinese Culture Atlas to Cloudflare Pages | Main pushes | Deploy static output and Pages Functions; verify production routes and Access |
| CMS D1 bootstrap | Controlled Main changes | Apply production D1 migrations and idempotent import when approved |

GITHUB_TOKEN is automatically supplied to Actions. CLOUDFLARE_API_TOKEN is a repository Actions secret for Pages deployment; it is not a CMS or Admin credential.

## CMS GitHub App

The Admin API is designed to use a repository-scoped GitHub App to create content/media branches and pull requests. The browser must never receive an App private key or installation token.

Production setup is incomplete. These Pages settings are absent:
- GITHUB_APP_ID
- GITHUB_INSTALLATION_ID
- GITHUB_APP_PRIVATE_KEY

The App must be installed only on this repository and receive the minimum permissions documented in [GitHub App publication setup](../runbooks/github-app-publication.md). The CMS must not merge PRs or write directly to Main.

## Publication boundary

1. Admin saves a draft to D1.
2. A specific D1 revision is exported to a CMS-owned branch.
3. A PR is opened for human review.
4. Human reviewer checks content, metadata, rights and tests.
5. Human merges to Main.
6. CI and Pages deployment publish the static snapshot.
7. The protected Admin sync endpoint records the merged transition in D1.

Until the App is installed and production acceptance is complete, do not claim that CMS publication or media upload is operational.
