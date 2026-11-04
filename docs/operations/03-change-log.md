# Development Change Log

Record verified changes and operational outcomes. A source commit, passing CI, successful Pages upload and completed custom-domain validation are distinct milestones.

## 2026-11-04 — Initial Astro static website MVP

Implemented the static Astro site, four Markdown collections, public information pages, static verifier and GitHub Actions CI. No runtime API, database, admin CMS, login, media upload or verified event listing was included.

## 2026-11-04 — Cloudflare Pages Direct Upload selected

Provisioned the Cloudflare Pages project \`chinese-culture\` and selected GitHub Actions + Wrangler Direct Upload. The Pages project uses static output and no Functions. Git integration was not selected.

## 2026-11-05 — Pages deployment credential workflow

Added the protected Pages deployment workflow using repository secret \`CLOUDFLARE_API_TOKEN\`. The Cloudflare account ID is embedded in the workflow; it is not a secret. Main pushes trigger production deployment; pull requests remain non-deploying.

## 2026-11-05 — First production deployment verified

- Main commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- CI run [#41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795): success.
- Deployment run [#41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872): success.
- Cloudflare production deployment: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Pages deployment URL: \`https://ce2e7daa.chinese-culture-79h.pages.dev\`.
- Pages reports \`uses_functions=false\`.

This confirms the static production deployment. It does not by itself prove that every browser, accessibility or custom-domain test passed.

## 2026-11-04 — Custom domain and DNS configuration

Cloudflare zone \`chinese-culture.site\` became active. Pages custom domains were added for the apex and \`www\`. Proxied CNAME records point both hostnames to \`chinese-culture-79h.pages.dev\`. An enabled 301 redirect rule sends \`www\` to the apex while preserving path and query string.

## 2026-11-05 — Custom-domain validation rechecked

The individual Pages domain endpoint reported \`chinese-culture.site\` as active with verification and HTTP validation active. \`www.chinese-culture.site\` remained pending HTTP validation. The pending hostname must not be described as fully active. See [domain DNS change log](domain-dns-change-log.md).

## 2026-11-05 — Documentation baseline

Added current-state architecture, owner guides, localization and CMS status, Cloudflare configuration, credential guidance, security operations, rollback, incident recovery and backup documentation. The docs explicitly distinguish implemented behavior from the requested but not-yet-implemented bilingual CMS target.

Agent 0's \`docs/openspec/\` contracts were not present on the inspected \`main\` snapshot and remain outside this documentation change.
