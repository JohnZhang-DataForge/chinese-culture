# Content Management Guide

**Status:** Multilingual content and D1-backed CMS are implemented; GitHub App publication setup and production acceptance remain pending.

## Content inventory

The current catalog contains 13 conceptual articles and 39 locale variants:
- 5 lessons
- 3 culture articles
- 3 festival guides
- 2 book guides

Supported locale IDs are en, zh-CN and es; public URL segments are en, zh-cn and es. The lessons collection is exposed through the learn route. See [Content Inventory](../content/06-content-inventory.md).

## Source-of-truth rules

- D1 (CMS_DB) is the canonical editable store.
- Each article has an immutable contentId; locale variants share that ID and have independent slugs and content.
- Markdown under src/content/ on main is a generated static publication snapshot.
- Do not create a parallel schema or edit generated snapshots to bypass the CMS workflow.
- CC-CONTENT-001 v1.2.0 is normative. See [content schema and routing](../architecture/08-content-schema-and-routing.md).

## Editing through Admin

The protected Admin workspace is at /admin/ and requires Cloudflare Access.

The implemented workflow supports content list/filtering, locale editing, Save Draft to D1, revision read-back and sanitized preview. Local D1 and browser tests pass. Authenticated production CRUD still needs owner acceptance.

When editing:
1. Confirm the correct content item and locale.
2. Preserve the shared immutable contentId.
3. Edit only the intended locale variant.
4. Keep titles, descriptions, category, slug, body, image alt text and source references localized and accurate.
5. Save as a draft and reload it to verify persistence.
6. Review the preview and revision information.

## Publication and unpublication

The intended workflow creates a reviewed GitHub PR from the exact D1 revision. A human reviews and merges the PR; the CMS never auto-merges or writes directly to main. The merge triggers static build and Pages deployment. D1 publication state is synchronized only through the explicit protected POST endpoint after the matching PR merges.

This workflow is not production-accepted yet because the repository-scoped GitHub App is not installed/configured. Do not manually update D1 state to simulate publication.

## Media

Media upload is designed around signature validation, alt text, credit and license metadata, and a separate reviewed PR. Production media acceptance is blocked on GitHub App setup. Do not invent image rights or use unlicensed assets.

## Events and homepage

The Events page remains an intentionally empty state; there is no event editor or verified event dataset. Homepage layout and navigation settings are not part of the current CMS API. Do not claim they can be edited from Admin.

## Validation and safety

Run npm run validate:content, npm test, npm run build, npm run verify and npm run test:browser for code/content changes. Automated tests use local D1 only. Never point tests at production D1 or commit secrets.
