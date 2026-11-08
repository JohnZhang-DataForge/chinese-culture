# Development Change Log

Document verified changes, decisions and release status. Do not confuse code creation with deployment.

## 2026-11-04 — Initial Astro static website MVP (feature branch)

**Reason:** Begin implementing the planned educational website while preserving a free Cloudflare Workers static hosting architecture.

### Source added

- Astro static-only project and `wrangler.jsonc` pointing to `./dist`.
- Original illustrated-by-CSS homepage, reusable layout, accessible mobile navigation and story cards.
- Generated index/detail routes for four Markdown content collections.
- Five beginner lessons, three culture articles, three festival explainers and two book guides.
- Events empty-state page; About, Contact (channel pending), Editorial, Privacy, Accessibility and 404 pages.
- GitHub Actions build-only CI, Node static verifier, favicon, headers and robots policy.

### Documentation added or updated

Developer runbook, implementation status, repository map, content schema/routes, test strategy, this change log and root documentation index. Architecture ADRs reflect the selected implementation baseline.

### Constraints preserved

No paid service, database, always-on Node.js process, Cloudflare SSR adapter, Worker API, secrets, personal data collection, external media embed or unverified event listings.

### Verification

At initial commit, source is in a feature branch; build and CI outcomes must be recorded separately. **No public Cloudflare deployment verified.**

### Follow-up

Run CI, fix any build problems, review PR, merge, complete cultural/a11y review, assign contact channel and perform an authorized Cloudflare Free preview/release.

### CI verification, first pass

[GitHub Actions run #41717562416](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41717562416) passed on 2026-11-03 20:59 UTC: npm install, Astro static build (25 pages), and static verifier (12 expected routes, 29 files, no Worker SSR) succeeded. A follow-up patch upgrades GitHub Actions checkout/setup-node to v7 and adds internal-link checks. Merge requires that follow-up run to pass as well.

### CI validation hardening — final pass

An intermediate CI run [#41717877814](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41717877814) exposed a malformed JavaScript regular expression in the new internal-link checker. The checker was rewritten and required a minimum count to prevent silent no-op tests. [Run #41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724) then passed: **25 static pages, 13 educational guides, 29 assets, 700 local links, zero SSR worker**. This confirms build-time source integrity, **not** browser accessibility or a Cloudflare deployment.

## Integration to main

[PR #1](https://github.com/JohnZhang-DataForge/chinese-culture/pull/1) was squash-merged after [CI run #41718253670](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718253670) completed successfully. Main commit: [778b5ea](https://github.com/JohnZhang-DataForge/chinese-culture/commit/778b5ea54ee9aec6120524f25aa119c5107191c9). This milestone delivers **source code and documentation**, not a public production deployment.

## 2026-11-04 — Prepare deployable CI artifact

Added a main-only `chinese-culture-dist` artifact after build and static verification. Artifact contains only generated public `dist/` files and is retained for one day. No Cloudflare credentials or secrets were added to GitHub; deployment will use the authorized Cloudflare connection. This workflow change must pass CI before using its artifact.

## 2026-11-04 — Evaluate alternate Worker upload path (not selected)

A direct Worker-script upload was investigated as a possible workaround for the Pages asset-upload authorization path. It was not selected or implemented: the existing product design is a static Pages site, and the Pages Direct Upload workflow is the better fit. No Worker fallback was deployed.

## 2026-11-04 — Select Cloudflare Pages Direct Upload for the public static site

The embedded Worker fallback was not selected for production because it would make every page request invoke Worker code. The Cloudflare Pages Direct Upload project `chinese-culture` has been provisioned at `https://chinese-culture-79h.pages.dev`, production branch `main`. Cloudflare Git integration returned an account-side installation error, so CI will use Wrangler Direct Upload instead. The deployment workflow is gated until a least-privilege Cloudflare API token and account ID are stored as GitHub Actions secrets. Pages remains static-only: no Functions, database or runtime server. Static asset requests are free and unlimited; Free limits include 500 builds/month, 20,000 files/site and 25 MiB/file.

## 2026-11-04 — Pages deployment workflow and verified upload bundle

Updated the repository to use Cloudflare Pages Direct Upload as the production target. Added a credential-gated GitHub Actions workflow and a `npm run deploy` Wrangler command. The build-only CI run [#41829390039](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41829390039) passed: Astro build, static verification and the 29-file deployment artifact all succeeded. The Pages project exists but still has no production deployment. The verified ZIP can be uploaded once through the dashboard without creating an API token; future automatic deployments require `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub Actions secrets.

## 2026-11-04 — Documentation and Pages launch checklist verified

The runbook, architecture plan, repository map and implementation status were aligned to the Pages Direct Upload decision. Final build-only CI [#41829806975](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41829806975) passed on main commit `658088da09400449d09a0fdcbe1111a09efa724a`. The deployment workflow correctly remains skipped until the owner enables it or manually dispatches it after adding the required secrets. The Pages project still has no production deployment.

## 2026-11-05 — Cloudflare Pages deployment investigation

Verified that the Pages Direct Upload project exists but has zero deployments. The Git integration error does not block the selected Direct Upload approach. The Cloudflare API connection can issue a short-lived Pages upload JWT, but the subsequent asset upload requires a custom Authorization header unavailable through the connected API action. Updated the deployment workflow to use GitHub Actions + Wrangler with a protected Pages Write API token; Cloudflare GitHub App authorization is not required. No production deployment has been claimed.

## 2026-11-05 — Simplify the Pages deployment credential

Hardcoded the non-secret Cloudflare account ID in the deployment workflow and reduced the required GitHub secret to `CLOUDFLARE_API_TOKEN` with the Pages Write role. Added a preflight check with an actionable error and documented manual workflow dispatch plus optional automatic deployment via `CLOUDFLARE_DEPLOY_ENABLED=true`. The first public deployment still awaits the owner-created token; CI build success is not treated as deployment success.

## 2026-11-05 — Enable deployment after repository secret setup

The user confirmed that repository secret `CLOUDFLARE_API_TOKEN` has been added. Removed the extra `CLOUDFLARE_DEPLOY_ENABLED` variable gate so pushes to `main` trigger the Pages Direct Upload deployment automatically. Pull requests remain non-deploying. This commit triggers the first production deployment; success must be verified from the resulting Actions run and Pages deployment record.

## 2026-11-09 — CMS production-readiness integration

- Extended the content contract to three locale variants (en, zh-CN, es) and preserved the existing 39 public Markdown articles with deterministic content IDs and legacy Unsplash cover URLs.
- Added an idempotent D1 importer and a production-only bootstrap workflow; production migration/import is triggered after the integration PR reaches main.
- Completed live D1 Admin UI integration, secure preview, GitHub App publication/media PR generation, explicit PR status synchronization and D1 revision updates after merge.
- Added local Pages Functions/D1 integration tests, GitHub App JWT tests and media signature validation.
- Verified the Cloudflare Pages deployment, CMS_DB binding, Cloudflare Access coverage for both Admin and Admin API paths, exact-email policy, ADMIN_EMAIL and CSRF secret configuration.
- Remaining manual release gate: install the repository-scoped GitHub App and configure GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY as Pages production variables/secrets. Production D1 bootstrap/import and live end-to-end publication tests remain pending until merge and App setup.
