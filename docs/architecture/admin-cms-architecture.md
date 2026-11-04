# Admin CMS Architecture

**Current status:** Not implemented. This is a status and boundary document, not an API contract.

## Current implementation

The inspected source contains no \`/admin/\` page, admin JavaScript application, \`/api/admin/*\` route, Pages Functions directory, server-side API, content database or GitHub API write integration. There is no browser-based content management workflow today.

The current publishing mechanism is GitHub-based: edit Markdown/Astro source in a branch, open a pull request, pass CI, merge to \`main\`, and let the Pages deployment workflow publish the static output.

## Requested future direction

The Agent 5 task brief describes the following intended high-level flow:

~~~mermaid
flowchart TD
  A[Browser Admin UI] --> B[Pages Functions API]
  B --> C[Authentication and authorization]
  C --> D[GitHub API]
  D --> E[Private content repository]
  E --> F[GitHub Actions]
  F --> G[Cloudflare Pages deployment]
~~~

This is a proposed target from the task brief, not a verified or approved implementation contract. Agent 0's API and content contracts must be read before endpoint names, payload schemas, file paths, commit behavior or authorization scopes are documented as final.

## Decisions still requiring an approved contract

- API resource model and versioning.
- How draft, published and unpublished content is represented.
- Whether CMS writes create branches and pull requests or commit directly.
- Content validation and preview behavior.
- Conflict handling when two editors change the same item.
- Media storage and upload limits.
- Audit history and attribution.
- Access policy, owner identity and server-side token verification.
- Error responses, rate limits and abuse protection.
- Recovery if GitHub API writes succeed but deployment fails.

## Deployment implications

The current Pages project reports \`uses_functions=false\`. Adding Pages Functions changes the runtime and security model and may consume Workers Free quota. Do not add a Functions directory or describe a dynamic admin API as live until the implementation and Cloudflare deployment are verified.

## Owner guidance until CMS delivery

Use the GitHub web interface and the review workflow in [Administrator User Guide](../implementation/admin-user-guide.md). There is no admin URL or admin login to use at this time.
