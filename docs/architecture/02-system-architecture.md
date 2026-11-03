# System Architecture — Cloudflare Free Static-first

**Status:** Proposed · **No implementation exists yet.**

## Logical deployment

```text
Authors / Editors
      |
      v
Private GitHub (Markdown and image rights + PR reviews)
      |
      v
Node.js + Astro static build (CI runner, not Cloudflare runtime)
      |
      v
Pre-rendered HTML / CSS / client JS / licensed media
      |
      v
Cloudflare Workers Static Assets — Free
      |
      v
Public readers (no database, no app server, no Worker execution for normal pages)

Future only: explicitly approved /api/* routes → Workers Free runtime
```

## Architectural boundaries

- **Build-time compute:** Node.js runs only on developer machine or CI to compile static output.
- **Delivery-time hosting:** Cloudflare serves static assets and caches them near readers.
- **Dynamic compute:** optional Worker invocations for future functions; 100,000/day and 10 ms CPU/request on Free.
- **Content state:** Git-reviewed Markdown is authoritative; no runtime DB.
- **Security:** private source repository and credentials remain separate from publicly deployed website assets.
- **External event links:** reference official organizers rather than processing tickets.
- **Images:** optimize and license them; each static asset must fit current platform limits.

## Content publishing flow

1. Editor prepares source-backed content and metadata.
2. Reviewers validate accuracy, rights, accessibility and source links in a PR.
3. Accepted changes merge to `main`.
4. CI builds static Astro output with a pinned supported Node.js version.
5. Authorized deployment publishes static files to Cloudflare Workers Static Assets.
6. Readers receive cacheable pages without calling dynamic APIs.

## Why no Cloudflare runtime Node.js server?

Workers is an event-driven JavaScript runtime with selective Node compatibility, not a persistent VM. Do not assume a normal Express/PM2 daemon, background queue or writable filesystem. Most reader interactions use client-side scripts or outbound links.

## Future expansion

If contact forms, search services, accounts or event registration become necessary, create a separate ADR for Worker routes, free-quota fit, security, data storage, deletion, monitoring and failure cases.

## Reliability and release

Build once, serve cached assets, test preview URLs, validate 404/redirects, and keep last-known-good assets/releases for rollback. Monitor any Worker invocations; for the MVP there should be none for typical pages.

## Related

[Cloudflare free deployment plan](06-cloudflare-free-node-deployment.md) · [ADR-0004](../decisions/ADR-0004-no-always-on-node-server.md)
