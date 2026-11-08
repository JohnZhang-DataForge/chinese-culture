# Admin CMS Architecture

**Current status:** No production Admin CMS in `main`.  
**Target architecture:** Agent 0 OpenSpec PR #3 — Proposed, not yet Ready or merged.

## Current implementation

The inspected `main` source has no `/admin/` route, Admin API, Pages Functions, separate Admin Worker, content database, browser upload service or GitHub API write integration. Current publishing uses GitHub branches/PRs and the main-branch Pages deployment workflow.

## Proposed target topology

~~~mermaid
flowchart TD
  A[Admin browser] --> B[Cloudflare Access]
  B --> C[Static Admin UI on Pages]
  B --> D[Separate Cloudflare Worker: /api/admin/v1/*]
  D --> E[Access JWT, role, CSRF and origin validation]
  E --> F[GitHub App installation token]
  F --> G[Private GitHub repository]
  G --> H[CMS content branch]
  H --> I[Pull request and human review]
  I --> J[Merge main]
  J --> K[GitHub Actions]
  K --> L[Astro static build and Pages deployment]
~~~

The public Astro website remains static and does not call the Admin API for normal reader requests. The Admin API is a separately deployed Cloudflare Worker, not Pages Functions or Astro SSR.

## Shared API contract proposed by Agent 0

OpenAPI 3.1.0 v1.0.0 in PR #3 defines base URL `https://chinese-culture.site/api/admin/v1` and these operations:

| Path | Operation |
|---|---|
| `GET /session` | Verified editor identity, role and CSRF token |
| `GET /content` | List content variants and drafts |
| `POST /content` | Create first draft variant |
| `GET /content/{contentId}?locale=...` | Read one variant and revision |
| `PUT /content/{contentId}?locale=...` | Save draft |
| `POST /content/{contentId}/translations` | Create linked translation |
| `POST /content/{contentId}/preview` | Render sanitized preview |
| `POST /content/{contentId}/media` | Upload image to CMS branch |
| `POST /content/{contentId}/submit` | Create/update PR for review/publish/unpublish |
| `DELETE /content/{contentId}/draft` | Discard safe draft branch |
| `GET /pull-requests/{number}` | Read PR and checks state |

Mutations use CSRF protection and optimistic concurrency via `If-Match`; stale revisions return conflict. Errors use RFC 9457 Problem Details. The API never merges a PR.

## Agent integration state

- Agent 0 PR #3: shared design and API contract are Proposed, not Ready.
- Agent 4 PR #4: draft Admin UI exists on its branch. It uses development-only mock records; the PR says real API integration and CRUD/publish are pending.
- Agent 5 branch: backend code currently adds `functions/` Pages Functions middleware. This conflicts with Agent 0's separate Worker design and must be resolved before either backend implementation or docs can be called final.
- Agent 6 PR #6: QA includes conditional Admin tests; write tests are disabled by default and require an isolated preview target.

## Publishing boundary

The CMS must save to `cms/<contentId>/<locale>` branches and submit PRs to `main`. It must not write directly to `main`, merge PRs, bypass required checks or expose GitHub App credentials to the browser.

## Until release

Do not direct owners to use `/admin/` as a production CMS. The current owner process is documented in [Administrator User Guide](../implementation/admin-user-guide.md).
