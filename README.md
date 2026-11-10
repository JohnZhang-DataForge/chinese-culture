# Chinese Culture Atlas

**Status (2026-11-11):** Multilingual public site and D1-backed Admin foundation are deployed. GitHub App publication/media integration and final production Admin acceptance remain open.  
**Production:** [https://chinese-culture.site](https://chinese-culture.site) · **Hosting:** Cloudflare Pages Free · **Framework:** Astro 5 static output + Pages Functions for private Admin APIs.

A multilingual educational website for exploring Chinese culture through lessons, art, traditions, festivals and literary reading guides.

## Current implementation

- Public English, Simplified Chinese and Spanish routes: `/en/`, `/zh-cn/`, `/es/`.
- 13 educational article concepts with 39 locale variants (13 per locale).
- Static public article pages, localized navigation, canonical/hreflang metadata, sitemap and localized 404 behavior.
- Events page with an honest empty state; no unverified event listings.
- Five localized informational pages: About, Accessibility, Contact, Editorial Policy and Privacy.
- Protected Admin workspace at `/admin/`, Cloudflare Access and Pages Functions under `/api/admin/v1/`.
- Production D1 database bound as `CMS_DB`; D1 is the canonical editorial store for content, translations and revisions.
- Public pages remain static and do not query D1 or Admin APIs.
- GitHub Actions validates content, local D1 migrations, tests, Astro output and Admin browser behavior; Main pushes deploy to Cloudflare Pages.

## Current release gates

- The repository-scoped GitHub App is not yet installed/configured. Production variables `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` and `GITHUB_APP_PRIVATE_KEY` are absent. GitHub PR publication and media-upload acceptance remain blocked on owner-side setup.
- Authenticated production Admin CRUD and reviewed publish/unpublish acceptance are not yet signed off.
- The GitHub repository currently has no main-branch ruleset; owner configuration is still required.
- Pages rollback rehearsal and final editorial sign-off remain open.
- The Events collection and public contact channel are intentionally not fabricated.

## Start locally

Requires Node.js 20.19 or later (CI uses Node.js 22) and npm.

```bash
npm install
npm run dev
```

Useful validation commands:

```bash
npm run validate:content
npm test
npm run build
npm run verify
npm run test:browser
```

For isolated Pages preview/browser checks, use `npm run test:preview` where the required preview environment is available. Automated tests use local D1 only; never point tests at production D1.

## Deployment and data boundaries

A push to `main` runs CI and the Cloudflare Pages deployment workflow. The deployment credential is stored in GitHub Actions as `CLOUDFLARE_API_TOKEN`; never put its value in source control or chat. Public pages are built from the reviewed Markdown snapshots on `main`. D1 remains the canonical editable store. The CMS must not auto-merge PRs or write directly to `main`.

## Project map

- `src/pages/` — public locale routes and Admin shell.
- `src/content/` — generated publication snapshots for en, zh-CN and es.
- `src/i18n/` — localized UI copy and section metadata.
- `functions/api/admin/v1/` — authenticated Admin API.
- `database/migrations/` — ordered D1 migrations.
- `scripts/` — content validation, import, static verification and local CMS tests.
- `public/` — public assets, headers and redirects.
- `.github/workflows/` — CI, Pages deployment and controlled D1 bootstrap.
- `docs/` and `openspec/` — architecture, content policy, contracts, runbooks and acceptance gates.

## Documents

- [Documentation index](docs/README.md)
- [Implementation status](docs/implementation/04-implementation-status.md)
- [Repository map](docs/architecture/07-implemented-repository-map.md)
- [Content schema and routing](docs/architecture/08-content-schema-and-routing.md)
- [Content inventory](docs/content/06-content-inventory.md)
- [Simplified Chinese style guide](docs/content/07-simplified-chinese-editorial-style-guide.md)
- [Chinese editorial review](docs/content/08-zh-cn-editorial-review-2026-11-11.md)
- [Developer runbook](docs/implementation/05-developer-runbook.md)
- [Cloudflare deployment runbook](docs/operations/04-cloudflare-deployment.md)
- [GitHub App publication setup](docs/runbooks/github-app-publication.md)

## Editorial principles

Use original prose, distinguish documented history from folklore and modern interpretation, acknowledge regional variation, cite reputable educational references and respect image/text rights. A passing build is not a substitute for cultural or language review.
