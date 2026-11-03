# Content Schema, Routing and Author Workflow

**Status:** Implemented MVP baseline · **Updated:** 2026-11-04

## Source of truth

Markdown content lives under `src/content/`, categorized into `lessons`, `culture`, `festivals` and `books`. `src/content.config.ts` validates metadata using Astro collections and a glob loader.

## Frontmatter fields

| Field | Required? | Type | Meaning |
|---|---|---|---|
| `title` | Yes | string | Reader-facing name and browser title |
| `description` | Yes | string | Introductory summary and SEO description |
| `category` | Yes | string | Section descriptor displayed above title |
| `chinese` | No | string | Chinese characters shown with language annotation |
| `pinyin` | No | string | Pronunciation metadata (planned UI enhancement) |
| `level` | No | string | e.g. Beginner |
| `order` | No | number | Learning sequence; defaults to alphabetical after unspecified order |
| `readingMinutes` | No | positive integer | Estimated time, default 5 |
| `featured` | No | boolean | Editorial feature flag, default false (future curated home behavior) |

## Routing contract

The file name (without `.md`) becomes the entry ID and URL slug. For example:

- `src/content/lessons/02-language-and-writing.md` → `/learn/02-language-and-writing/`
- `src/content/culture/calligraphy-and-the-brush.md` → `/culture/calligraphy-and-the-brush/`
- `src/content/festivals/spring-festival.md` → `/festivals/spring-festival/`
- `src/content/books/the-analects.md` → `/books/the-analects/`

Static paths are enumerated in Astro at build time. A renamed Markdown file changes its public URL: create a redirect plan and update internal links before renaming published content.

## Adding a lesson

1. Copy the [article brief](../templates/article-brief.md) and verify teaching intent, sources and reviewer.
2. Write a unique kebab-case Markdown file under the correct collection.
3. Add `title`, `description`, `category`, and optionally `chinese`, `pinyin`, `level`, `order` and `readingMinutes`.
4. Write original, beginner-friendly sections; differentiate historical evidence from folklore.
5. Add trusted further-reading links and licensing information for any media.
6. Check language, dates, article link paths and first-time-reader clarity.
7. Run `npm run build` and `npm run verify`, then submit a PR for review.

## Editorial quality

These first 13 pages are development starter content and need final human cultural/factual review before an official public launch. External links and citations are educational references, not endorsements. Full copyrighted books and scraped images are not committed.

## Future schema changes

Avoid breaking existing content. Version conceptual schema decisions in documentation; update all affected files and generated routes together with CI evidence. Introduce translations through a separate reviewed localization decision.
