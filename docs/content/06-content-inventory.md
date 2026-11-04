# Content Inventory — English Baseline

**Inventory date:** 2026-11-05  
**Inspected ref:** `main` at `539b37c9bfa5363f7149c95563bd549957eeff3d`  
**Scope:** Existing public content and SEO metadata only. This document does not define or replace the shared bilingual content schema.

## Summary

| Content area | Existing items | Source |
|---|---:|---|
| Beginner lessons | 5 | `src/content/lessons/` |
| Culture articles | 3 | `src/content/culture/` |
| Festival guides | 3 | `src/content/festivals/` |
| Book guides | 2 | `src/content/books/` |
| **Educational content total** | **13** | Markdown collections |
| Homepage | 1 | `src/pages/index.astro` |
| Collection landing pages | 4 | `src/lib/sections.ts` + dynamic collection index |
| Informational pages | 5 | About, Contact, Privacy, Accessibility, Editorial Policy |
| Events page | 1 | Honest empty state; no event records |
| Not-found page | 1 | `src/pages/404.astro` |

There are 13 existing English Markdown guides. All are currently included in the generated public site. The current schema has no explicit publication-status field, tag list, stable content ID field, cover-image field, or localized body/SEO fields. Existing file basenames are the Astro collection entry IDs and public detail slugs; preserve them as stable identifiers unless the shared contract explicitly introduces a backward-compatible ID mapping.

No event announcements, event dates, event organizer records, public contact email, or cover-image references were found in the inspected content. Do not invent any of these.

## Educational content inventory

The following metadata is copied from existing frontmatter. Missing optional values are identified rather than inferred.

| Existing ID / slug | Collection | English title | English description | Category | Chinese term | Pinyin | Level | Order | Reading min. | Featured |
|---|---|---|---|---|---|---|---|---:|---:|---|
| `01-a-living-culture` | lessons | A Living Culture, Not a Single Story | Begin with the people, places and changing traditions behind the word culture. | Lesson 01 · Foundations | 文化 | wénhuà | Beginner | 1 | 5 | Yes |
| `02-language-and-writing` | lessons | Language and Writing: First Steps | Learn how characters, pronunciation and different spoken varieties fit together. | Lesson 02 · Language | 字 | zì | Beginner | 2 | 5 | Yes |
| `03-festivals-and-calendars` | lessons | Festivals and the Chinese Calendar | Why celebrations move across the Gregorian calendar and what they mean to communities. | Lesson 03 · Celebrations | 节日 | jiérì | Beginner | 3 | 5 | Yes |
| `04-art-of-the-brush` | lessons | The Brush as a Way of Seeing | Explore how writing, painting and poetry connect in Chinese artistic traditions. | Lesson 04 · Arts | 笔墨 | bǐmò | Beginner | 4 | 5 | No |
| `05-stories-and-reading` | lessons | Stories, Books and Cultural Memory | See how literature carries ideas across generations while inviting new interpretations. | Lesson 05 · Literature | 故事 | gùshi | Beginner | 5 | 5 | No |
| `calligraphy-and-the-brush` | culture | Calligraphy and the Brush | Why the line of a brush is both language and art in a long Chinese tradition. | Arts & craft | 书法 | shūfǎ | — | 6 | Yes |
| `family-tables-and-hospitality` | culture | Around the Family Table | A gentle introduction to shared meals, hospitality and the diversity of local customs. | Everyday life | 家 | jiā | — | 5 | No |
| `reading-a-painting` | culture | How to Read a Chinese Painting | Discover brushwork, inscriptions and the space surrounding an image. | Visual arts | 画 | huà | — | 5 | Yes |
| `dragon-boat-festival` | festivals | Dragon Boat Festival: Water, Memory and Community | Explore Duanwu through racing, traditional foods and different stories of its origins. | Festival guide | 端午节 | Duānwǔ Jié | — | 6 | No |
| `mid-autumn-festival` | festivals | Mid-Autumn Festival: A Moon Shared Across Distance | Meet the moon, mooncakes and stories of gathering and longing. | Festival guide | 中秋节 | Zhōngqiū Jié | — | 5 | Yes |
| `spring-festival` | festivals | Spring Festival: Welcoming a New Year | Understand a season of preparation, reunion, greetings and local variation. | Festival guide | 春节 | Chūnjié | — | 6 | Yes |
| `journey-to-the-west` | books | Journey to the West: A Reader's Guide | Meet the Monkey King and the many layers of a celebrated adventure. | Classic fiction | 西游记 | Xīyóu Jì | — | 6 | No |
| `the-analects` | books | The Analects: A Reader's Guide | Approach a classical collection of conversations and teachings with historical context. | Philosophy & classics | 论语 | Lúnyǔ | — | 6 | No |

### Existing article-body coverage

All 13 articles have English Markdown bodies and further-reading references. Their subjects are:

- Lessons: cultural diversity and context; Chinese writing and spoken varieties; festivals and calendars; brush-based arts; literature and cultural memory.
- Culture: calligraphy; family meals and hospitality; reading Chinese paintings.
- Festivals: Dragon Boat Festival; Mid-Autumn Festival; Spring Festival.
- Books: *Journey to the West*; *The Analects*.

The existing bodies already include Chinese characters and Pinyin where educationally useful. Preserve these terms and the distinctions between documented history, traditional narrative, regional custom and modern practice when translating.

## Public-page and SEO inventory

| Route | Source | Current page title | Current description / SEO behavior | Localization notes |
|---|---|---|---|---|
| `/` | `src/pages/index.astro` | Chinese Culture Atlas — Discover, learn, connect | BaseLayout default: “An approachable guide to Chinese traditions, art, literature, festivals and everyday life.” | Hero, section headings, card intro copy, feature band and all homepage links are English. |
| `/learn/` | Dynamic index + `sections.ts` | Learn | Chinese Culture Atlas | Section description from `sections.ts`: “An approachable introduction to language, customs, celebrations and creative traditions — one idea at a time.” | Localize eyebrow, heading, description, note, count label and navigation label. |
| `/culture/` | Dynamic index + `sections.ts` | Culture | Chinese Culture Atlas | Section description from `sections.ts`: “Discover objects, ideas and creative practices that connect past and present.” | Localize section copy and card metadata. |
| `/festivals/` | Dynamic index + `sections.ts` | Festivals | Chinese Culture Atlas | Section description from `sections.ts`: “Explore the stories and community customs around celebrations across the year.” | Preserve lunisolar-calendar context and date caveat. |
| `/books/` | Dynamic index + `sections.ts` | Books | Chinese Culture Atlas | Section description from `sections.ts`: “Reading guides to classic works, ideas and the many worlds of Chinese literature.” | Localize section copy and card metadata. |
| `/learn/{slug}/`, `/culture/{slug}/`, `/festivals/{slug}/`, `/books/{slug}/` | Dynamic detail page + Markdown | Frontmatter title + “ | Chinese Culture Atlas” | Frontmatter description is passed to BaseLayout meta description. | 13 article bodies and their metadata need Chinese counterparts. |
| `/about/` | `src/pages/about.astro` | About the project | Chinese Culture Atlas | BaseLayout default description. | Project mission, editorial approach and prelaunch note. |
| `/events/` | `src/pages/events/index.astro` | Events | Chinese Culture Atlas | Explicit: “Cultural event announcements, verified with organizers before publication.” | Preserve honest empty state; no fabricated events. |
| `/contact/` | `src/pages/contact.astro` | Contact | Chinese Culture Atlas | BaseLayout default description. | Explicitly says no verified public contact address is available. |
| `/privacy/` | `src/pages/privacy.astro` | Privacy | Chinese Culture Atlas | BaseLayout default description. | Static-site privacy notice; must preserve caveat that hosting provider may process request data. |
| `/accessibility/` | `src/pages/accessibility.astro` | Accessibility | Chinese Culture Atlas | BaseLayout default description. | Describes design goals and says formal audit is not complete. |
| `/editorial-policy/` | `src/pages/editorial-policy.astro` | Editorial policy | Chinese Culture Atlas | BaseLayout default description. | Sources, corrections, rights and verified-event policy. |
| 404 | `src/pages/404.astro` | Page not found | Chinese Culture Atlas | BaseLayout default description. | Localize error text and home-page link label. |

### Shared layout and navigation strings

`src/layouts/BaseLayout.astro` contains additional English UI copy requiring localization: brand aria label, desktop/mobile navigation, “Skip to content”, footer slogan, project description, Explore/The project labels, footer links and footer description. The current document head emits `lang="en"`, a description and a title; it does not currently emit localized canonical, Open Graph, hreflang or alternate-language metadata.

`src/components/StoryCard.astro` contains the English fallback “Explore the story” and “min read”. Article detail templates contain “Home”, “min read”, “Original learning guide”, “Keep exploring”, “Back to …” and “Our editorial approach”. These are shared frontend strings, not Markdown content, and are inventoried here for coordination with Agent 2; this agent will not modify frontend components.

## Metadata and integrity findings

- Existing article titles, descriptions, category labels, Chinese terms, Pinyin, reading time, featured flags and lesson order are present as listed above.
- `featured` is explicitly true on 7 articles; absent values use the current schema default false.
- `readingMinutes` is present on all 13 articles.
- `order` is present only on the five lessons.
- `level` is present only on the five lessons.
- No explicit `tags`, `status`, `coverImage`, `author`, `reviewer`, `reviewedAt`, `contentId`, localized slug, Chinese title/description/body, or locale-specific SEO metadata exists in the current frontmatter.
- Current Astro entry IDs derive from file basenames. Existing detail URLs therefore depend on those basenames.
- No separate event records or image assets are referenced by the 13 article frontmatters.
- The current content collection schema requires `title`, `description`, and `category`; `readingMinutes` defaults to 5 and `featured` defaults to false.
- Static informational pages mostly inherit the same generic BaseLayout meta description rather than providing page-specific descriptions.

## Migration constraints

1. Keep all existing English titles, descriptions and Markdown bodies intact unless a correction is separately approved.
2. Keep existing file basenames/entry IDs and current English public slugs stable.
3. Use Agent 0's approved bilingual content contract before changing frontmatter, collection schema or translation file layout.
4. Coordinate Chinese routes, translated slugs, missing-translation behavior and locale resolution with Agent 2.
5. Translate only claims already supported by the English source; flag ambiguous or unsupported cultural/historical claims for editorial review.
6. Preserve source links, internal references, dates, names, existing Chinese characters and Pinyin.
7. Do not add fake contact details, event records, publication dates, authors, reviewers or images.
8. Do not change routes, public components, admin UI, backend APIs or the shared schema in this content branch.
