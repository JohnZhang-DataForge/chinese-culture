# Media Management

**Current status:** No media-management UI or upload service is implemented.

## Current source inventory

The inspected repository's \`public/\` directory contains:

- \`public/favicon.svg\`
- \`public/robots.txt\`
- \`public/_headers\`

There is no current image library, upload route, media database, cover-image frontmatter field, image transformation pipeline or Cloudflare Images/R2 binding. The shared content schema does not define a cover-image field.

## Current asset delivery

Astro copies files placed under \`public/\` into the static build output. Public assets are deployed with the rest of \`dist/\` through Cloudflare Pages Direct Upload. The current project does not use a dynamic upload API.

For a small manually managed static asset, add the file to \`public/\` through a reviewed Git change and reference its public path in the relevant page or Markdown. Use descriptive filenames, meaningful alternative text for informative images, optimized formats and appropriate licensing/attribution. Do not commit private or unlicensed media.

## Owner workflow today

There is no browser upload button. The owner must add an approved image to the repository through GitHub, open a pull request, and verify that the asset appears in the build output. The content card component currently renders text metadata and does not read a cover-image field.

## Future media requirements

Before implementing CMS uploads, Agent 0 and the CMS/media owners must define:

- Storage location and whether files live in Git, R2 or another approved service.
- Upload authorization and maximum file size/type.
- File naming, stable IDs, metadata and duplicate handling.
- Image dimensions, optimization and responsive delivery.
- Alt text, captions, credits, license and usage rights.
- Delete/replace behavior and references from translated content.
- Backup, retention and recovery behavior.

Do not document R2, Cloudflare Images or an upload endpoint as configured until the resource and code are verified.

See [content management guide](../implementation/content-management-guide.md) and [backup and recovery](../operations/backup-and-recovery.md).
