# Content Management Guide

This guide separates the current GitHub editing workflow from the proposed future Admin CMS. It does not assume that a browser CMS is already available.

## Current content locations

| Content type | Current folder or file | Current public URL |
|---|---|---|
| Learning lessons | \`src/content/lessons/\` | \`/learn/<slug>/\` |
| Culture articles | \`src/content/culture/\` | \`/culture/<slug>/\` |
| Festival guides | \`src/content/festivals/\` | \`/festivals/<slug>/\` |
| Book guides | \`src/content/books/\` | \`/books/<slug>/\` |
| Events | \`src/pages/events/index.astro\` | \`/events/\` |
| Homepage | \`src/pages/index.astro\` | \`/\` |
| Header/footer navigation | \`src/layouts/BaseLayout.astro\` | Shared shell |

The filename without \`.md\` becomes the current Astro entry ID and public slug.

## Current Markdown metadata

The current schema requires \`title\`, \`description\` and \`category\`.

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

\`readingMinutes\` defaults to 5 and must be a positive integer. \`order\` is used for collection index ordering and lesson homepage ordering. \`featured\` is defined but current homepage code does not use it as a filter.

## Add an article or lesson today

1. Choose the correct current folder.
2. Create a unique lowercase kebab-case Markdown filename.
3. Add valid frontmatter.
4. Write original, well-sourced content.
5. Check references, Chinese terms, internal links and image rights.
6. Open a pull request.
7. Wait for CI and human review.
8. Merge to \`main\`; verify the Pages deployment before announcing publication.

Lessons go in \`src/content/lessons/\`; their public path is \`/learn/\`.

## Add a festival

Create a Markdown file in \`src/content/festivals/\`. Keep it an evergreen cultural guide. Do not use this folder for dated local event announcements.

## Manage books

Book guides belong in \`src/content/books/\`. Publish original reading guidance. Do not upload or reproduce copyrighted full texts, modern translations or scans without rights.

## Publish an event

There is no event collection or event editor. \`src/pages/events/index.astro\` is a hard-coded empty state. Adding a file under a new \`src/content/events/\` folder will not create a route today.

Agent 0's proposed future content contract includes an \`events\` collection, but it is not implemented in \`main\`. A future event feature needs verified organizer, date/time zone, location, registration link and expiry handling.

## Modify homepage sections

The homepage is authored in \`src/pages/index.astro\`. It currently selects the first three lessons sorted by \`order\`, then takes the first three culture and festival entries returned by Astro. It does not filter by \`featured\`. Changes require an Astro source PR.

## Update navigation

Header/footer links are hard-coded in \`src/layouts/BaseLayout.astro\`. Section route mappings are in \`src/lib/sections.ts\`. There is no navigation settings screen in current \`main\`.

## Images today

There is no upload interface or media library. Static files can be added to \`public/\` through GitHub and referenced by public path. The current schema has no cover-image/media field and StoryCard does not render cover images.

## Proposed future CMS content contract

Agent 0 PR #3 proposes content files at:

\`src/content/{collection}/{locale}/{slug}.md\`

Supported locale IDs are \`en\` and \`zh-CN\`; URL segments are \`en\` and \`zh-cn\`. Every language variant shares an immutable UUID \`contentId\`. Required fields include locale, slug, title, description, category, status, featured and timestamps. Status values are \`draft\`, \`published\`, \`unpublished\`.

The same proposal defines Git-backed media under \`public/media/{contentId}/\`, with JPEG/PNG/WebP/AVIF only and an 8 MiB maximum. Every published image requires alt, credit and license metadata.

This contract is Proposed, not Ready. Do not migrate current files or create a parallel schema before Agent 0 announces the contract freeze.

See [Content Publishing Workflow](../architecture/content-publishing-workflow.md).
