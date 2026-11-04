# GitHub Integration

**Status:** Implemented for source control, CI and deployment; CMS GitHub API integration is not implemented.

## Repository model

- Repository: \`JohnZhang-DataForge/chinese-culture\`.
- Visibility: private.
- Default branch: \`main\`.
- Source of truth: Astro source, Markdown collections, public static assets and workflow configuration committed to Git.
- Current publishing boundary: reviewed pull request merged to \`main\`.

## Workflows

| Workflow | Trigger | Behavior |
|---|---|---|
| \`site-ci.yml\` | Pull request; push to \`main\` | Node 22, install, Astro build and static verifier |
| \`pages-deploy.yml\` | Push to \`main\`; manual dispatch | Build and verify, check Cloudflare token, Wrangler Pages Direct Upload |

The CI workflow uploads a short-lived \`chinese-culture-dist\` artifact for main-branch pushes. Production deployment is a separate workflow and does not run for pull requests.

## Credentials

- \`GITHUB_TOKEN\` is the built-in token supplied by GitHub Actions. The CI workflow requests only \`contents: read\`; the deployment workflow declares \`contents: read\` and \`deployments: write\`.
- \`CLOUDFLARE_API_TOKEN\` is a repository Actions secret used by Wrangler. It should have only the Cloudflare Pages Write permission needed for this project/account.
- No GitHub personal access token, GitHub App private key or CMS-specific GitHub credential is present in the current implementation.

## Current automation boundary

GitHub Actions can build and deploy the static site. It does not currently receive content edits from a browser CMS, create editorial pull requests on behalf of an admin UI, or process media uploads.

## Safe contribution process

1. Branch from current \`main\`.
2. Change only the intended source/content files.
3. Run \`npm run build\` and \`npm run verify\`.
4. Open a pull request and wait for CI.
5. Review the generated route and content changes.
6. Merge only after approval.
7. Confirm the main-branch Pages deployment succeeds.

Do not add credentials to repository files, commit messages, workflow logs or public assets. See [GitHub token setup](../operations/github-token-setup.md).
