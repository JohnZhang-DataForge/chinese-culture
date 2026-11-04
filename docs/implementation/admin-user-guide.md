# Administrator User Guide

**Important:** A production browser-based Admin CMS is not merged or deployed yet. The current `main` branch has no supported Admin login or live content dashboard.

Agent 4 has an open draft PR that adds an Admin UI workspace, but its PR states that it uses development-only mock records. Production does not display mock content or claim writes succeeded. The UI is not a production publishing tool until it is integrated with Agent 5's real backend and Agent 0's approved contract.

## What you can manage today

Use the private GitHub repository:

- Lessons, culture articles, festivals and books are Markdown files.
- The Events page is currently a fixed empty state.
- Homepage sections and navigation are hard-coded Astro source.
- Images are static repository assets; there is no upload library.

## Editing an existing article in GitHub

1. Open the private repository `JohnZhang-DataForge/chinese-culture`.
2. Browse to `src/content/` and open the correct current folder: `lessons`, `culture`, `festivals` or `books`.
3. Open the Markdown file and choose Edit.
4. Change the text while preserving the metadata block at the top.
5. Choose **Commit changes** and create a new branch. Do not commit directly to `main`.
6. Open the pull request GitHub offers, or create one from the Pull requests tab.
7. Explain the content change and wait for CI.
8. Ask for review, then merge only after the content and checks are approved.
9. Confirm the main-branch Pages deployment succeeds before considering the change live.

If you do not have permission to edit the private repository, ask the repository owner to grant access. Do not share passwords or tokens.

## Adding new content

Use the current folder and metadata rules in [Content Management Guide](content-management-guide.md). A new Markdown file in one of the four collections becomes a public page after it is merged to `main` and the production deployment succeeds.

The future contract proposes locale-specific paths such as `src/content/culture/en/<slug>.md` and `src/content/culture/zh-CN/<slug>.md`. Do not move current files until Agent 2/3 migration is merged.

## What is not yet available in production

| Requested feature | Current production state |
|---|---|
| Dashboard with real content records | Not available |
| Create/edit/delete through browser | Not available |
| Draft and publish buttons | Not available |
| Private preview | Not available |
| Translation manager | Not available |
| Media upload/library | Not available |
| Homepage section editor | Not available |
| Navigation editor | Not available |
| Admin login and authorization | Not available |

## How to know a change is live

A passing PR check is not a production deployment. After merge, open GitHub Actions and check **Deploy Chinese Culture Atlas to Cloudflare Pages** for the merged commit. The deployment job must complete successfully. Then check the public page in a browser.

Do not use a draft Admin UI branch or mock records to publish real content.
