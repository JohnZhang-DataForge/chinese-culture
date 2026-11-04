# Media Management

**Current status:** No media-management UI or upload service in \`main\`.  
**Future target:** Git-backed media upload proposed in Agent 0 PR #3.

## Current source inventory

The inspected repository's \`public/\` directory contains the favicon, robots policy and response headers. There is no current image library, upload route, media database, cover-image frontmatter field, image transformation pipeline or Cloudflare Images/R2 binding.

The current content schema has no \`media\` field. Story cards render text metadata and do not read cover-image fields.

## Current asset delivery

Astro copies files under \`public/\` into the static build output. Public assets are deployed with the rest of \`dist/\` through Cloudflare Pages Direct Upload.

There is no browser upload button. A manually managed static asset must be added through a reviewed Git change. Use descriptive names, optimized formats, meaningful alternative text, and documented image rights.

## Proposed media contract

Agent 0's Proposed design and content contract specify:

- Git-backed path: \`public/media/{contentId}/{safeFileName}\`.
- Allowed types: JPEG, PNG, WebP and AVIF.
- Maximum upload size: 8 MiB per file.
- SVG, HTML and other unsupported formats are rejected.
- The Worker validates file signatures; it does not trust browser MIME declarations.
- Uploads are committed to the same CMS content branch.
- Every published image has a media metadata record with \`src\`, \`alt\`, \`credit\` and \`license\`; \`sourceUrl\` is used when needed to evidence rights.
- Decorative images may use empty alt only when explicitly marked decorative.

R2 is not the proposed MVP storage path. It requires a separate decision if Git or Pages limits become a real constraint.

## Implementation status

The media contract is in Agent 0 PR #3 (Proposed). Agent 4's draft UI includes a media-library screen, but it is not a production upload integration. Agent 5's backend runtime conflict with the proposed separate Worker must be resolved before media upload is implemented.

See [content management guide](../implementation/content-management-guide.md) and [backup and recovery](../operations/backup-and-recovery.md).
