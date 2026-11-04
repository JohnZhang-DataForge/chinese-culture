# Architecture and Design: Bilingual Website + Admin CMS

**Change ID:** bilingual-admin-cms  
**Status:** Proposed; implementation must follow the contracts in docs/openspec/contracts/.

## 1. Design principles

- Preserve the current Astro 5 public website and its visual design.
- Keep public pages statically generated and cacheable.
- Treat the private GitHub repository as the authoritative content store and audit trail.
- Use Cloudflare Access for identity enforcement and a Worker for server-side authorization and GitHub access.
- Use one shared content contract and one OpenAPI contract across agents.
- Never allow a CMS browser session to write directly to main.
- Prefer simple Git-backed persistence over a new database.
- Do not expose drafts or private source material through public build output.

## 2. Logical topology

~~~text
Reader
  |
  v
https://chinese-culture.site
  |
  v
Cloudflare Pages (Astro static HTML/CSS/JS)
  |
  +--> /en/*       English public routes
  +--> /zh-cn/*    Simplified Chinese public routes
  +--> /           redirect to /en/

Editor
  |
  v
Cloudflare Access policy (email/group allowlist)
  |
  +--> /admin/*             protected static Admin UI
  |
  +--> /api/admin/v1/*      protected Worker route
                                |
                                v
                         Access JWT verification
                         role + CSRF + origin checks
                                |
                                v
                         GitHub App installation token
                                |
                                v
                         Private repository
                         cms/<contentId>/<locale> branches
                                |
                                v
                         Pull request -> review/checks
                                |
                             merge main
                                |
                                v
                         GitHub Actions -> Astro build
                                |
                                v
                         Cloudflare Pages deployment
~~~

The public Pages origin and the Admin API share the production hostname. Cloudflare Worker route precedence handles /api/admin/*; Cloudflare Access protects both /admin/* and /api/admin/* before traffic reaches the application.

## 3. Runtime boundaries

### Public site

Astro builds all public routes at build time. It reads the shared content collections and emits only published variants. The site must not call the Admin API for normal rendering and must not contain GitHub credentials. A language switcher may use statically generated translation metadata.

### Admin UI

The Admin UI is a static Astro route under /admin/. It is not secret merely because it is hidden; authorization is enforced at the Cloudflare Access edge and again by the Worker API. The UI stores only short-lived display state and the CSRF token in memory. It does not store GitHub tokens.

### Admin Worker

Deploy as an independent Worker with route /api/admin/v1/*. Keep its package and configuration separate from the Astro Pages project, for example workers/admin/package.json and workers/admin/wrangler.jsonc. Do not add Pages Functions or SSR to the public site.

The Worker:
- Verifies CF-Access-Jwt-Assertion using the configured Access issuer/JWKS.
- Checks issuer, audience, signature, exp/nbf and email.
- Maps the verified email to a configured role.
- Validates Origin and CSRF token for mutations; does not enable wildcard CORS.
- Obtains short-lived GitHub App installation tokens server-side.
- Uses the GitHub Contents/Git Data/Pull Requests APIs to write only to CMS branches and create/update PRs.
- Enforces input limits, content schema and optimistic concurrency.
- Returns RFC 9457 Problem Details for failures.

## 4. Identity and authorization

### Edge policy

Cloudflare Access protects:
- https://chinese-culture.site/admin/*
- https://chinese-culture.site/api/admin/*

Only named editor/admin identities or an explicitly approved Access group can enter. The public site remains accessible without Access.

### Application verification

The Worker must not trust the edge policy alone. It verifies the signed JWT in CF-Access-Jwt-Assertion against Cloudflare's public signing keys. Required checks include:
- Expected issuer for the configured Access team.
- Expected audience for this application policy.
- Valid signature and supported algorithm.
- Not expired; not before current time.
- Non-empty verified email.
- Role mapping from a server-side allowlist/configuration.

Initial roles:
- **admin:** all CMS operations, including submit publish/unpublish PRs.
- **editor:** create/edit/translate/preview/upload and submit review PRs.
- **reader:** no CMS API access; public-site access only.

The MVP may initially allow only one admin identity. Do not infer roles from user-controlled request fields.

### CSRF and browser constraints

Because Access may authenticate with browser cookies, every mutation must require:
- Exact Origin equal to the configured production origin.
- Sec-Fetch-Site same-origin where available.
- A valid X-CSRF-Token returned by GET /session and bound to the verified identity/expiry.
- Expected Content-Type and method.
- No permissive CORS response.

The Worker should use a short-lived signed CSRF token or another reviewed double-submit design. GET requests must not mutate state.

## 5. GitHub App integration

Create a GitHub App installed only on JohnZhang-DataForge/chinese-culture. Minimum permissions:
- Metadata: read.
- Contents: read and write.
- Pull requests: read and write.
- Checks/statuses: read only if needed to display PR status.

No organization administration, Actions administration, secrets, workflow write, issues write or repository administration permission is required for content editing.

Store App ID, installation ID and private key as Worker secrets. The Worker signs a short-lived App JWT, exchanges it for an installation access token and keeps the token only in server-side ephemeral memory until expiry. Never return it to the browser or include it in logs.

## 6. Content source layout

The target source layout is:

~~~text
src/content/
  lessons/
    en/<english-slug>.md
    zh-CN/<chinese-slug>.md
  culture/
    en/<english-slug>.md
    zh-CN/<chinese-slug>.md
  festivals/
    en/<english-slug>.md
    zh-CN/<chinese-slug>.md
  books/
    en/<english-slug>.md
    zh-CN/<chinese-slug>.md
  events/
    en/<english-slug>.md
    zh-CN/<chinese-slug>.md

public/media/<contentId>/<safe-file-name>.<ext>
~~~

The collection name is the content type. Each locale file for the same conceptual item has the same contentId and a locale-specific slug. The normative fields and examples are in contracts/content-schema.md.

Existing English records must retain their current public slug in the en locale during migration. Add legacy redirects from current unprefixed routes to /en/... routes. Do not delete or rename content without an explicit redirect and migration record.

## 7. Content lifecycle

### Draft

- The CMS saves to cms/<contentId>/<locale>.
- The stored frontmatter status is draft.
- The draft is not generated into public routes, sitemap or public featured modules.
- The CMS can read it back and render a private preview.

### Review

- Submit for review creates or updates a PR from the CMS branch to main.
- The PR body includes contentId, locale, collection, intent and an editorial checklist.
- CI validates schema, translation linkage, Markdown, links and static build.
- No automatic merge is allowed.

### Publish

- The CMS updates the PR branch so that the locale record has status published.
- A human reviewer reviews the final diff and checks.
- Only a permitted merge to main triggers the Pages deployment.
- A published page is live only after deployment succeeds and browser verification passes.

### Unpublish

- The CMS updates the PR branch to status unpublished.
- The PR review and merge process is the same as publishing.
- The next public build removes the route and any featured placement.
- The source remains in Git for audit/history and can later be republished through another PR.

### Featured

featured is independent of status. A featured record with draft or unpublished status is never rendered publicly. The frontend must always apply both conditions.

## 8. Media upload

MVP storage is Git-backed under public/media/<contentId>/. The Admin API accepts multipart/form-data with a file and metadata.

Allowed file types:
- image/jpeg
- image/png
- image/webp
- image/avif

Maximum size: 8 MiB per file. SVG and HTML are rejected. The Worker validates actual file signatures rather than trusting the browser Content-Type, generates a safe filename, prevents path traversal and commits the asset to the same CMS branch as the content. The response includes the committed path, public URL, content type, size and blob SHA.

Each use of an image in content must have meaningful alt text and a rights record (original, licensed with terms, public domain with evidence, or other documented permission). Store credit/license/source URL in the content media metadata. Do not accept uploads without alt text or rights classification.

If image size/volume makes Git unsuitable, propose R2 in a separate ADR; do not silently change storage.

## 9. Routing and SEO

- Locale prefix: /en/ or /zh-cn/.
- Section names remain stable across locales: learn, culture, festivals, books, events.
- Slugs may be localized independently.
- Root / redirects to /en/.
- Existing unprefixed routes redirect to /en/ equivalents.
- Canonical URLs point to the localized page.
- hreflang alternates are emitted only for published translations.
- x-default points to the English equivalent when it exists.
- Sitemap contains only published localized routes.
- The language switch uses contentId mapping, never slug substitution.
- Missing translations are visibly identified; never silently display an English page under a zh-CN URL.

## 10. API and concurrency

The API contract is contracts/admin-api.openapi.yaml. Its base path is /api/admin/v1. Agents 4 and 5 must generate/validate against that single contract.

Mutations use If-Match with the last-seen Git blob/commit SHA. A stale revision returns 409 Conflict with current revision information. Do not silently retry a conflicting overwrite.

The Worker maps application operations to GitHub:
- Read content and branch state.
- Create/update a CMS branch from current main or an existing branch.
- Commit Markdown/media to that branch.
- Create/update a PR to main.
- Read PR/check status.
- Never merge the PR.

## 11. Error handling and observability

All API errors use application/problem+json following RFC 9457 with a stable application code and requestId. Never expose stack traces, GitHub private details, Access tokens or repository credentials. Translate upstream GitHub rate limits and outages to controlled 429/502/503 responses.

Log requestId, route, authenticated actor identifier (email or pseudonymous hash), action, contentId, locale, result and GitHub object identifiers. Do not log content bodies, media bytes, cookies, JWTs, private keys or installation tokens.

## 12. CI and release

Required checks before merge:
- Astro build and static verifier.
- Content schema and translation-pair validation.
- Locale route and redirect tests.
- Worker unit/security tests.
- OpenAPI lint and frontend/backend contract tests.
- Media upload validation tests.
- Accessibility/link/SEO smoke tests.

The Pages workflow deploys only after main receives a reviewed merge. The Worker deployment is a separate workflow and must use least-privilege Cloudflare credentials. A Worker release must not modify Pages production assets unless the same reviewed change requires it.

## 13. Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Draft content leaks | Build includes only status=published; tests assert draft/unpublished absent |
| GitHub credential exposure | GitHub App private key and tokens are Worker secrets only |
| Unauthorized CMS access | Access edge policy plus Worker JWT verification and role checks |
| Concurrent edits overwrite each other | If-Match SHA and 409 conflict handling |
| Translation routes mismatch | Shared contentId and translation validation |
| Malicious media upload | MIME signature checks, strict allowlist, 8 MiB limit, SVG rejected |
| PR merge bypass | Worker has no merge endpoint; main protection and required checks |
| Existing links break | Legacy redirects and route compatibility tests |
| Cloudflare cost grows unexpectedly | Static public pages, admin-only Worker execution, no database/R2 in MVP |
| Documentation becomes stale | Agent 7 updates status/change log; Agent 0 signs off integration |

## 14. Explicit architectural decisions

1. **Static-first remains:** Astro Pages stays static; no SSR migration.
2. **Separate Worker:** Admin API is a standalone Worker, not Pages Functions.
3. **GitHub as CMS database:** Git branches/commits/PRs store content and audit trail.
4. **Cloudflare Access:** no custom password/session database.
5. **GitHub App:** no browser PAT and no direct browser-to-GitHub writes.
6. **Locale-prefixed URLs:** /en and /zh-cn.
7. **Git-backed media first:** R2 is deferred.
8. **PR-based publishing:** no automatic merge or direct main write.
9. **Shared contracts:** OpenAPI and content schema are owned by Agent 0.
