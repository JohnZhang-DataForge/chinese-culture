# Administrator User Guide

**Important:** A browser-based Admin CMS has not been delivered yet. There is no supported \`/admin/\` page, admin login or content dashboard in the current website. Do not enter credentials into a page claiming to be the site admin.

This guide explains the current safe owner workflow using GitHub's website. It is written for an owner who does not need to know Astro or run a local development environment.

## What you can manage today

You can request or make content changes in the private GitHub repository:

- Lessons: add or edit a lesson.
- Culture: add or edit an article.
- Festivals: add or edit a festival guide.
- Books: add or edit a reading guide.
- Existing English page text: edit the corresponding Markdown or Astro page.
- Events: the public page is currently a fixed empty state; there is no event editor.
- Homepage and navigation: currently require a source-code change; they are not editable through a form.

## Editing an existing article in GitHub

1. Open the private repository \`JohnZhang-DataForge/chinese-culture\`.
2. Browse to \`src/content/\` and open the correct folder: \`lessons\`, \`culture\`, \`festivals\` or \`books\`.
3. Open the Markdown file you want to change.
4. Use the pencil/Edit control in GitHub.
5. Make the text change. Keep the metadata block at the top of the file.
6. Choose **Commit changes** and create a new branch for the change. Do not commit directly to \`main\`.
7. Open the pull request GitHub offers, or create one from the repository's Pull requests tab.
8. Give the change a clear title and explain what changed.
9. Wait for the automated checks to pass and review the preview/source carefully.
10. Merge only after the content and checks are approved.

If the GitHub interface does not offer the expected edit permission, ask the repository owner to grant the appropriate access. Do not work around access controls by sharing passwords or tokens.

## Adding new content

Use the exact folders and metadata rules in [Content Management Guide](content-management-guide.md). A new file in one of the four collection folders becomes a public page after it is merged to \`main\` and the production deployment succeeds.

## What is not available yet

| Requested feature | Current state |
|---|---|
| Dashboard with content lists | Not implemented |
| Create/edit/delete buttons | Not implemented |
| Draft and publish buttons | Not implemented |
| Preview inside Admin | Not implemented |
| Feature/unfeature controls | Not implemented |
| Category/tag manager | Not implemented |
| Image upload/library | Not implemented |
| Homepage section editor | Not implemented |
| Navigation editor | Not implemented |
| Language/translation manager | Not implemented |
| Admin user login | Not implemented |

## How to know a change is live

A successful pull request check is not a production deployment. After merge, open the repository's Actions tab and check **Deploy Chinese Culture Atlas to Cloudflare Pages** for the new main-branch commit. The deployment job must complete successfully. Then check the live page in a browser.

If you are unsure whether a change is safe to merge, leave the pull request open and request a technical review rather than publishing it.
