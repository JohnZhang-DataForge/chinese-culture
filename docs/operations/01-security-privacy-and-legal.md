# Security, Privacy, Copyright and Responsible Publishing

**Status:** Operating guidance for the deployed public site and protected Admin · **Updated:** 2026-11-11 · Not legal advice.

## Application boundary

- Public article pages are static and do not query D1 or Admin APIs.
- The protected Admin workspace and `/api/admin/v1/*` endpoints use Cloudflare Access and Pages Functions.
- D1 (`CMS_DB`) stores editorial content and revisions; it is not exposed to the browser.
- The privacy notice distinguishes public browsing from administrator authentication. Cloudflare Access may set authentication cookies for the protected Admin area; these are access-control cookies, not advertising or analytics cookies.
- No public visitor accounts, contact form, newsletter or site-integrated analytics are currently offered.

## Security controls and remaining gates

- Access policy restricts Admin routes to the designated administrator.
- Pages Functions validate Access JWT, role, Origin and CSRF for mutations.
- Automated tests use local D1 only.
- Never expose API tokens, Access secrets, D1 credentials or GitHub App private keys in source, logs, screenshots or public assets.
- The repository-scoped GitHub App is not yet installed/configured; its PR/media publishing flow remains unaccepted.
- The repository currently has no main-branch ruleset; the owner must configure required checks and no-bypass policy.

## Privacy principles

Collect the least personal data necessary. Do not add visitor tracking, location profiling, accounts or newsletter collection without a documented purpose, retention/deletion rules and updated privacy notice. Re-review the notice when Cloudflare configuration or public functionality changes.

## Copyright and media

Use original writing and properly licensed or permissioned media. Preserve source attribution and image alt text. Do not assume modern translations, illustrations, photographs or editions are public domain because an underlying classical work is old. New media must pass file-signature, rights metadata and human PR review before publication.

## Cultural responsibility

Distinguish historical evidence, folklore, traditional narrative and contemporary practice. Preserve uncertainty and regional variation. Flag disputed or under-sourced claims for editorial review. A passing schema/build test does not establish cultural accuracy.

## Events and corrections

Do not publish invented event schedules, organizer details, public contact addresses or registration links. Event listings require current organizer verification. Keep a correction path documented before inviting public submissions.
