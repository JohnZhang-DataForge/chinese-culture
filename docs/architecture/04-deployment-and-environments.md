# Deployment and Environments — Cloudflare Workers Free

**Status:** Proposed · **No deployment has been created.** This file is a procedure design, not runnable configuration.

## Environment model

| Environment | Location | Role |
|---|---|---|
| Local | Developer machine | Preview Astro site using Node.js tools; no persistent production server |
| CI build | GitHub Actions or approved build runner | Reproducible Astro static generation and tests |
| Preview | Cloudflare preview deployment / subdomain | Review candidate static files without affecting public site |
| Production | Cloudflare Workers Static Assets — Free | Deliver all public pages and assets |

Prefer a free `workers.dev` URL initially; custom domains are optional and may have registration cost.

## No runtime Node server

Node.js executes while **building** the site. The production content is HTML, CSS, JS and media served by Cloudflare; no permanent Node server is launched. In future, request-driven Workers may execute compatible JavaScript/Node APIs only within free quota.

## Planned release workflow (future implementation)

1. Choose domain/hostname and authorize Cloudflare account access.
2. Implement Astro static generation **without** SSR or Cloudflare server adapter for the normal page routes.
3. Set CI to run a supported, pinned Node.js version and build static output.
4. Run checks for Markdown metadata, link integrity, accessibility, media rights and build success.
5. Deploy only generated static artifacts with restricted Cloudflare credentials.
6. Validate preview routes, CDN behavior, 404 pages, HTTPS, images and redirects.
7. Verify that normal visits are **static asset requests**, not Worker script invocations.
8. Review resource usage against Free caps, approve release and record artifact/commit.
9. If issues occur, redeploy last-known-good output and correct source via Git PR.

## Cloudflare-specific limits

Static asset requests are free and unlimited. As of November 2026, dynamic Worker requests are limited to 100,000/day and 10 ms CPU/request on Free, with 128 MB memory, 50 subrequests/request, up to 20,000 assets/version, and 25 MiB max per asset. Re-check [official billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) and [platform limits](https://developers.cloudflare.com/workers/platform/limits/) before deployment.

## Release gates

- All core site pages prerendered.
- No billable services, database, Worker SSR or background jobs provisioned without authorization.
- No secrets or internal-only Markdown copied to public assets.
- No external calls required to render regular articles.
- Verified preview and production content, domain/HTTPS, links, accessibility and safe rollback.

## Deferred

Native sign-up, dynamic event registration, authenticated tools, API routes and SSR require a separate design/ADR and an explicit budget. No GitHub Actions YAML, Cloudflare config or other code is added by this documentation change.

## Reference

[Cloudflare deployment architecture](06-cloudflare-free-node-deployment.md)
