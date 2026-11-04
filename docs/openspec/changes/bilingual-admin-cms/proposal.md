# Proposal: Bilingual Website and GitHub-backed Admin CMS

**Change ID:** bilingual-admin-cms  
**Owner:** Agent 0 — Chief Architect and Integration Lead  
**Status:** Proposed  
**Target domain:** https://chinese-culture.site

## Why

The current repository is a working English-only Astro 5 static website. Its editorial source is Markdown in GitHub and its production build is deployed to Cloudflare Pages by GitHub Actions. It does not yet provide Chinese pages, a browser-based editor, administrator authentication, a media upload workflow or a controlled publishing interface.

The next increment must add those capabilities without replacing the current design, abandoning the static-first hosting model, leaking repository credentials into the browser or creating independent content/API definitions across agents.

## Outcomes

1. Readers can use the complete public site in English and Simplified Chinese.
2. Every translated page has a stable shared content identity and a clear language counterpart.
3. Authorized editors can create, edit, preview and submit content using a browser CMS.
4. Draft, published, unpublished and featured semantics are consistent across content files, the CMS, API and public build.
5. Images can be uploaded through the CMS and committed to the private GitHub repository with rights and accessibility metadata.
6. GitHub is the canonical content store and audit history. Publication occurs through pull requests and reviewed merges.
7. A successful merge to main triggers the existing Cloudflare Pages deployment pipeline.
8. The production domain is chinese-culture.site, with HTTPS and a verified canonical host.
9. Public reading remains static-first; no database or always-on Node.js server is introduced.

## In scope

- Locale-aware Astro routing for en and zh-CN.
- Migration of the current English Markdown content into the shared content schema.
- Simplified Chinese translation records linked by stable contentId.
- Public language switcher, localized navigation, metadata, canonical URLs and hreflang.
- A browser Admin CMS with content list, editor, preview, translation status, media upload and publishing actions.
- Cloudflare Access protection for admin pages and API routes.
- A Cloudflare Pages Functions Admin API that validates Access JWTs and calls GitHub through a least-privilege GitHub App.
- Git-backed draft branches, pull requests, review, publish and unpublish operations.
- Shared API and content contracts, automated validation, security checks and operational documentation.
- Cloudflare Pages custom-domain and DNS configuration.

## Out of scope

- Public user registration, reader accounts, comments, social login for readers or learning-progress tracking.
- Newsletter subscriptions, payments, ticketing, event registration or public content submission.
- A runtime database (D1, KV, Durable Objects or external SQL) for content state.
- GitHub Personal Access Tokens in browser code or long-lived credentials in client storage.
- Direct CMS writes to main, automatic PR merging or bypass of required checks.
- Replacing the existing visual identity or rewriting existing editorial content without review.
- General-purpose public content APIs.
- R2 as the primary media store in this increment. Git-backed media is the agreed MVP path; R2 requires a separate decision if repository/Pages limits become a real constraint.

## Normative requirements

### Public localization

- **LOC-001:** The site SHALL support locale identifiers en and zh-CN.
- **LOC-002:** Public URLs SHALL use /en/ and /zh-cn/ prefixes, including the default English locale.
- **LOC-003:** The root URL / SHALL lead to the English landing page while preserving an explicit language-selection affordance.
- **LOC-004:** Existing unprefixed public routes SHALL redirect to their equivalent /en/ routes. Existing content slugs SHALL remain stable during the initial migration.
- **LOC-005:** Each localized page SHALL emit correct lang, canonical and alternate hreflang metadata.
- **LOC-006:** A language switch SHALL resolve the counterpart by contentId, not by assuming the two locale slugs are equal.
- **LOC-007:** If a translation is not published, the UI SHALL not link to a broken or draft public route; it SHALL show the language as unavailable or fall back to the locale index.

### Content model

- **CNT-001:** Every conceptual article SHALL have an immutable contentId shared by all its language variants.
- **CNT-002:** Each language variant SHALL have its own locale, slug, title, description, body and publication state.
- **CNT-003:** The schema in contracts/content-schema.md SHALL be the only agreed schema for Agents 2 and 3.
- **CNT-004:** Valid states SHALL be draft, published and unpublished. featured SHALL be an independent boolean, not a publication state.
- **CNT-005:** The public Astro build SHALL include only records whose status is published.
- **CNT-006:** Featured content SHALL be eligible for public featured placements only when status is published and featured is true.
- **CNT-007:** Unpublishing SHALL retain the source record in Git but remove it from public route generation.
- **CNT-008:** A contentId/locale pair SHALL be unique; a slug SHALL be unique within a collection and locale.

### Admin security

- **SEC-001:** Admin pages and Admin API SHALL be protected by Cloudflare Access.
- **SEC-002:** The Pages Functions middleware SHALL independently verify the Cloudflare Access JWT signature, issuer, audience, expiry and identity; trusting the presence of a header alone is prohibited.
- **SEC-003:** The Pages Functions middleware SHALL enforce an explicit administrator/editor allowlist or role mapping.
- **SEC-004:** GitHub App credentials SHALL remain in Pages Functions secrets. No GitHub token or private key may reach browser code, HTML, local storage or logs.
- **SEC-005:** The Pages Functions API SHALL validate request origin, CSRF protection, input schema, media type, media size and path safety.
- **SEC-006:** The GitHub App SHALL have only repository metadata read, contents read/write and pull-request read/write permissions required by the workflow.
- **SEC-007:** The API SHALL use optimistic concurrency and return 409 on stale content revisions.
- **SEC-008:** Security-relevant actions SHALL be auditable through Git commits, PR history and structured request logs without logging secrets or full sensitive payloads.

### CMS and publishing

- **CMS-001:** Authorized users SHALL be able to list, create, read and edit content variants.
- **CMS-002:** The CMS SHALL provide a preview of unsaved Markdown and metadata without making drafts public.
- **CMS-003:** The CMS SHALL support creation of a translation variant using the existing contentId.
- **CMS-004:** Media upload SHALL validate file signatures and enforce the agreed size/type limits.
- **CMS-005:** Save Draft SHALL write to a CMS-owned content branch, never directly to main.
- **CMS-006:** Submit for review SHALL create or update a pull request to main.
- **CMS-007:** Publish SHALL submit a PR revision with status published. The page becomes public only after the PR is merged.
- **CMS-008:** Unpublish SHALL submit a PR revision with status unpublished. The page disappears from the public build only after merge and deployment.
- **CMS-009:** No endpoint SHALL merge a PR or bypass GitHub branch protection.
- **CMS-010:** The CMS SHALL show the branch, commit SHA, PR URL and publishing state so editors can see what is saved, under review or live.

### Platform and deployment

- **PLT-001:** The public site SHALL remain Astro static output on Cloudflare Pages.
- **PLT-002:** Admin operations SHALL execute in Cloudflare Pages Functions under /api/admin/v1/*, deployed with the existing Pages Direct Upload workflow through Wrangler.
- **PLT-003:** The public website SHALL not require a Pages Function invocation for normal reading.
- **PLT-004:** A merge to main SHALL trigger build, validation and Pages deployment.
- **PLT-005:** The custom domain SHALL resolve to the Pages project, use HTTPS and have a documented canonical-host/redirect policy.
- **PLT-006:** CI SHALL validate content schema, translation relationships, public route output, API contract compatibility and Pages Functions tests.
- **PLT-007:** Secrets and private documentation SHALL never be included in dist/.

## Acceptance criteria

The release is accepted only when all of the following are demonstrated:

1. Both /en/ and /zh-cn/ home pages render in production and have correct language attributes.
2. All current public content has an English record and the agreed initial Chinese translation coverage; untranslated content is clearly identified and not falsely labelled bilingual.
3. Each translation pair uses the same contentId and the language switch opens the correct counterpart.
4. All public collection/detail routes use locale prefixes; legacy routes redirect without loops.
5. A schema test rejects missing IDs, invalid locales/states, duplicate contentId/locale pairs and duplicate locale slugs.
6. Draft and unpublished records are absent from generated public HTML and sitemap; published records are present; featured unpublished records are not featured.
7. An unauthenticated request to /admin/ and /api/admin/v1/* is denied.
8. An authenticated but unauthorized user is denied; an allowed administrator can use the CMS.
9. Browser bundles and network responses contain no GitHub App private key or installation token.
10. An editor can create and save a draft, reload it from GitHub, preview it, upload an allowed image and see its metadata.
11. A stale edit returns 409 and does not overwrite another editor's newer commit.
12. Submit for review creates a PR against main; publish/unpublish actions update the PR content state without merging it.
13. Required checks pass and a human-authorized PR merge to main publishes the expected result through Pages.
14. Unpublish removes the page from the public build while retaining its source in Git.
15. The public site passes responsive, keyboard, screen-reader, link, SEO, security-header and browser smoke tests.
16. https://chinese-culture.site serves the production build with valid HTTPS and canonical redirects.
17. Rollback to the previous known-good Pages deployment is documented and tested.
18. No unapproved paid service, database, public API or always-on Node.js service is introduced.

## Dependencies and assumptions

- The Cloudflare zone/domain is owned or can be delegated to the project owner.
- Cloudflare Access is available and configured for the production domain.
- A GitHub App can be installed on this private repository with restricted permissions.
- The repository owner can enable main-branch protection and required status checks.
- GitHub Actions has the protected Cloudflare Pages deployment secret already configured; the latest observed deployment run succeeded.
- The initial media size limit is 8 MiB per file and allowed formats are JPEG, PNG, WebP and AVIF. SVG is intentionally excluded.
- The CMS initially supports a small, explicitly allowlisted editor group.

## Delivery phases

1. **P0 — Contract freeze:** approve this proposal, content schema, API OpenAPI, ownership and integration protocol.
2. **P1 — Domain and security foundation:** verify custom domain, configure Access, install GitHub App and enable main protection.
3. **P2 — Bilingual public frontend:** locale routes, metadata, language switch, compatibility redirects and content filtering.
4. **P3 — Content migration:** stable IDs, English migration, Chinese translations, source/rights metadata and translation coverage report.
5. **P4 — Admin backend:** Pages Functions authentication, GitHub App token exchange, content/branch/PR operations, preview and media upload.
6. **P5 — Admin frontend:** dashboard, editor, translation management, preview, media and PR state.
7. **P6 — QA and hardening:** CI gates, contract tests, security tests, browser/a11y testing and operational drills.
8. **P7 — Integration and release:** ordered PR merges, production deployment, custom-domain validation and acceptance report.

Parallel work is allowed only after the relevant contract is marked Ready. See agent-ownership.md.
