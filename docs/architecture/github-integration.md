# GitHub Integration

**Status:** Implemented for source control, CI and deployment; CMS GitHub App integration is proposed.

## Current repository model

- Repository: \`JohnZhang-DataForge/chinese-culture\`.
- Visibility: private.
- Default branch: \`main\`.
- Source of truth: Astro source, Markdown collections, public assets and workflow configuration committed to Git.
- Current publishing boundary: reviewed pull request merged to \`main\`.

## Current workflows

| Workflow | Trigger | Behavior |
|---|---|---|
| \`site-ci.yml\` | Pull request; push to \`main\` | Node 22, install, Astro build and static verifier |
| \`pages-deploy.yml\` | Push to \`main\`; manual dispatch | Build and verify, token preflight, Wrangler Pages Direct Upload |

Pull requests run CI but do not deploy production. A main push triggers Pages deployment.

## Current credentials

- \`GITHUB_TOKEN\` is automatically supplied by GitHub Actions.
- \`CLOUDFLARE_API_TOKEN\` is a repository Actions secret used by Wrangler.
- No GitHub PAT is required by the current static-site workflow.
- No production CMS GitHub App integration exists in current \`main\`.

## Proposed GitHub App for the CMS

Agent 0's Proposed design specifies a GitHub App installed only on \`JohnZhang-DataForge/chinese-culture\` with minimum permissions:

- Metadata: read.
- Contents: read/write.
- Pull requests: read/write.
- Checks/statuses: read only if required to display PR status.

The separate Admin Worker would create short-lived installation tokens server-side. The token and App private key must never be returned to the browser or logged.

## Proposed editorial branch model

The Worker writes to \`cms/<contentId>/<locale>\` branches, creates or updates a PR to \`main\`, and reads PR/check status. It must not merge PRs. Human review and repository checks remain the publishing gate.

## Integration status

Agent 0's API contract is Proposed in PR #3. Agent 4's frontend PR is draft and waits for the real API. Agent 5's backend branch currently uses Pages Functions, which conflicts with the separate Worker topology proposed by Agent 0. Reconcile the backend runtime before describing GitHub App operations as implemented.

See [GitHub token setup](../operations/github-token-setup.md) and [Admin CMS architecture](admin-cms-architecture.md).
