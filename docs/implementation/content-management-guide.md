# Content Management Guide

This guide describes the content workflow implemented in the current repository. It does not assume an Admin CMS exists.

## Where content lives

| Content type | Folder or file | Public URL |
|---|---|---|
| Learning lessons | \`src/content/lessons/\` | \`/learn/<filename>/\` |
| Culture articles | \`src/content/culture/\` | \`/culture/<filename>/\` |
| Festival guides | \`src/content/festivals/\` | \`/festivals/<filename>/\` |
| Book guides | \`src/content/books/\` | \`/books/<filename>/\` |
| Events page | \`src/pages/events/index.astro\` | \`/events/\` |
| Homepage | \`src/pages/index.astro\` | \`/\` |
| Header/footer navigation | \`src/layouts/BaseLayout.astro\` | Shared site shell |

The filename without \`.md\` becomes the route slug. Use lowercase kebab-case names and avoid renaming published files unless redirects are planned.

## Required Markdown metadata

Every content file must include \`title\`, \`description\` and \`category\`.

~~~yaml
---
title: "A clear reader-facing title"
description: "A concise summary of the guide."
category: "Traditions"
chinese: "可选的中文术语"
pinyin: "ke xuan de zhong wen shu yu"
level: "Beginner"
order: 6
readingMinutes: 5
featured: false
---
~~~

Only the first three fields are required. \`readingMinutes\` defaults to 5 and must be a positive integer. \`order\` is used for ordering in collection indexes and the lesson homepage list. \`featured\` is in the schema but is not currently used by homepage selection logic.

## Add an article or lesson

1. Choose the right folder: lessons, culture, festivals or books.
2. Create a new Markdown file with a unique kebab-case filename.
3. Add valid frontmatter using the schema above.
4. Write original, well-sourced Markdown content.
5. Add links to reputable references and check all URLs.
6. Check that any Chinese characters and pinyin are correct.
7. Open a pull request and wait for CI.
8. After merge, confirm the Pages deployment succeeds and check the public route.

A lesson goes in \`src/content/lessons/\`; its public route uses \`/learn/\`, not \`/lessons/\`.

## Add a festival

Create a Markdown file in \`src/content/festivals/\`. Describe the tradition as an evergreen cultural guide. Do not use this collection to publish a dated local event announcement unless the content model and editorial process have been deliberately extended.

## Manage books

Book guides belong in \`src/content/books/\`. The site publishes original reading guidance; do not upload or reproduce copyrighted full texts, modern translations or scans without appropriate rights.

## Publish an event

There is no event collection or event editor today. \`src/pages/events/index.astro\` is a hard-coded empty state. Adding an arbitrary Markdown file under \`src/content/events/\` will not create an event page. A future event feature needs an approved schema, date/time zone handling, organizer verification, registration-link review, expiry behavior and route generation.

## Modify homepage sections

The homepage is authored in \`src/pages/index.astro\`. It currently selects the first three lessons sorted by \`order\`, then takes the first three culture and festival entries returned by Astro. The homepage does not use the \`featured\` field as a filter. Changing section headings, layout or selection rules requires an Astro source change and a pull request.

## Update navigation

The header and footer links are currently hard-coded in \`src/layouts/BaseLayout.astro\`. Content collection routes are defined in \`src/lib/sections.ts\`. Changing navigation requires a source-code change. There is no navigation settings screen.

## Upload an image

There is no upload interface or media library. Static assets can be added to \`public/\` through a reviewed Git change and referenced by their public path. The current content schema has no cover-image field, and the current story cards do not display cover images. Verify image rights, attribution, alternative text, file size and mobile rendering.

## Publish and unpublish

- **Publish:** merge the reviewed change to \`main\`; the Pages workflow deploys on a main push.
- **Unpublish a content entry:** remove its Markdown file through a reviewed PR. Plan a redirect if the URL has already been shared or indexed.
- **Draft:** keep unfinished content on a non-main branch or in a pull request. The current schema has no draft status field.
- **Unpublish an event:** not applicable; event management is not implemented.

See [content publishing workflow](../architecture/content-publishing-workflow.md) and [deployment guide](deployment-guide.md).
