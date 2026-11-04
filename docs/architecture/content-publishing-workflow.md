# Content Publishing Workflow

**Current status:** GitHub-based static publishing is implemented.  
**Future workflow:** Git-backed Admin CMS proposed in Agent 0 PR #3.

## Current workflow

~~~mermaid
flowchart TD
  A[Edit Markdown or Astro source] --> B[Create branch]
  B --> C[Open pull request]
  C --> D[GitHub Actions: build and verify]
  D --> E{Checks pass and review approved?}
  E -- No --> C
  E -- Yes --> F[Merge to main]
  F --> G[Pages deployment workflow]
  G --> H[Cloudflare Pages production]
~~~

Current collection folders:

| Collection | Current source directory | Current route |
|---|---|---|
| Lessons | \`src/content/lessons/\` | \`/learn/<slug>/\` |
| Culture | \`src/content/culture/\` | \`/culture/<slug>/\` |
| Festivals | \`src/content/festivals/\` | \`/festivals/<slug>/\` |
| Books | \`src/content/books/\` | \`/books/<slug>/\` |

A file in one of these collections is included in the build. There is no draft status field or scheduling mechanism. The homepage currently does not use \`featured\` to select content. Events are a hard-coded empty state.

## Proposed CMS workflow

The Agent 0 contract proposes:

~~~mermaid
flowchart TD
  A[Admin saves draft] --> B[cms/contentId/locale branch]
  B --> C[Private preview]
  C --> D[Submit for review]
  D --> E[Pull request to main]
  E --> F[Human review and required CI]
  F --> G{Approved?}
  G -- No --> E
  G -- Yes --> H[Human merges PR]
  H --> I[Pages build includes published content]
~~~

- Save Draft writes \`status=draft\` to a CMS-owned branch.
- Submit for review creates/updates a PR while keeping draft status.
- Publish changes the PR branch to \`status=published\`; the content becomes public only after human merge and successful Pages deployment.
- Unpublish changes the PR branch to \`status=unpublished\`; the public route is removed only after merge and deployment.
- The Worker API never merges PRs or writes directly to \`main\`.

## Proposed status semantics

| State | Public build | Source retention |
|---|---|---|
| \`draft\` | Excluded | CMS branch |
| \`published\` | Included | \`main\` after reviewed merge |
| \`unpublished\` | Excluded | Retained in \`main\` after reviewed merge |

\`featured\` is independent of status. Only published content can appear in public featured placements.

## Review requirements

Check factual accuracy, cultural nuance, sources, image rights, accessible alt text, metadata, locale completeness, internal links, route compatibility and generated public output. Draft and unpublished content must not appear in routes, sitemap, public search or featured modules.

The CMS workflow is proposed, not implemented in current \`main\`. See [content management guide](../implementation/content-management-guide.md).
