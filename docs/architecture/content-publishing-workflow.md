# Content Publishing Workflow

**Current status:** GitHub-based static publishing is implemented; browser CMS publishing is not.

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

## Current content source

| Collection | Source directory | Public route |
|---|---|---|
| Lessons | \`src/content/lessons/\` | \`/learn/<slug>/\` |
| Culture | \`src/content/culture/\` | \`/culture/<slug>/\` |
| Festivals | \`src/content/festivals/\` | \`/festivals/<slug>/\` |
| Books | \`src/content/books/\` | \`/books/<slug>/\` |

Astro reads Markdown at build time. The filename becomes the collection entry ID and public slug. Required frontmatter is \`title\`, \`description\` and \`category\`.

## Publication semantics

- A content file in one of the four collections is included in the static build.
- The repository has no \`status: draft\` field or scheduling mechanism.
- A pull request is a review boundary; merging to \`main\` makes the content eligible for the next production deployment.
- Removing a content file through a reviewed PR removes its generated page from the next deployment. Preserve Git history and plan redirects before removing a published slug.
- The schema includes \`featured\`, but the current homepage does not use it as a selection rule.
- Events are a hard-coded empty state in \`src/pages/events/index.astro\`; there is no event content collection or event publishing UI.

## Review responsibilities

Before merging, check source quality, factual nuance, references, copyright and image rights, metadata, Chinese terms, internal links and mobile readability. Keep event listings empty until there is a verified event workflow.

## Future CMS workflow

The admin CMS is not implemented. Its future draft, preview, publish and unpublish behavior must follow Agent 0's approved content/API contracts and be verified against the actual backend before this document is revised.

See [content management guide](../implementation/content-management-guide.md).
