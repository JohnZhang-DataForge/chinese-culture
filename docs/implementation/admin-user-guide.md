# Administrator User Guide

**Status:** Admin workspace and D1-backed API are deployed behind Cloudflare Access. Production end-to-end CRUD and GitHub publication acceptance remain open.

## Accessing Admin

1. Open https://chinese-culture.site/admin/.
2. Authenticate through the configured Cloudflare Access policy using the authorized administrator identity.
3. Do not share Access credentials, session cookies, CSRF tokens or API credentials.
4. If access is denied, ask the repository owner to verify the Access allowlist. Do not bypass the Access challenge.

The Admin workspace is not a public reader account system. The public site remains static and does not query D1.

## Content model

The site contains 13 conceptual articles with 39 locale variants: 13 English, 13 Simplified Chinese and 13 Spanish. Each language variant is linked by one immutable contentId, but has its own title, description, slug, body and publication state.

D1 (CMS_DB) is the canonical editable store. Markdown under src/content/ on main is generated publication output; do not edit those files as a substitute for CMS editing once the Admin workflow is enabled.

## Current Admin capabilities in the implementation

- List and filter D1-backed content records and locale coverage.
- Create/edit locale variants and save drafts to D1.
- Reload saved drafts and inspect revision state.
- Preview sanitized Markdown content.
- Display submission/PR state and publication status.

These capabilities have passed local D1 and browser CI, but authenticated production CRUD has not yet been signed off. Treat production acceptance as pending until the owner completes a real authorized browser smoke test.

## Publication and media limitations

The GitHub App is not yet installed/configured on this repository. The production Pages settings GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY are absent. Therefore:
- Do not claim publish/unpublish PR generation is operational in production.
- Do not attempt media upload as an accepted production workflow.
- Do not manually change D1 publication state to simulate a merge.
- Do not merge content PRs without human editorial review.

Once the App is configured, the CMS should create a branch and PR; a human reviews and merges it. The CMS must never auto-merge or write directly to main.

## How to verify a published change

A content PR merge is not itself proof of a live page. Verify the PR checks, merge commit, Main CI, Pages deployment and Cloudflare production commit. Then open the exact public locale route and check the content.

See [Content Management Guide](content-management-guide.md), [GitHub App publication setup](../runbooks/github-app-publication.md) and [OpenSpec tasks](../openspec/changes/bilingual-admin-cms/tasks.md).
