# System Architecture

**Status:** Implemented static Astro and Cloudflare Pages baseline.

The earlier proposal in this file has been superseded by the actual implementation. Use [System Overview](system-overview.md) as the canonical current-state description.

## Current architecture

Private GitHub source and Markdown content are reviewed through pull requests. GitHub Actions runs Node.js 22, builds Astro static output, verifies generated routes and links, then uses Wrangler Direct Upload to publish \`dist/\` to Cloudflare Pages Free.

~~~mermaid
flowchart TD
  A[Private GitHub repository] --> B[Pull request review]
  B --> C[main]
  C --> D[GitHub Actions]
  D --> E[Astro static build]
  E --> F[Static verifier]
  F --> G[Wrangler Direct Upload]
  G --> H[Cloudflare Pages]
  H --> I[Public readers]
~~~

## Runtime boundaries

The production site has no SSR adapter, Pages Functions, Worker entrypoint, database, runtime API or permanent Node.js process. The Events page is a static empty state. Bilingual routing and Admin CMS are not implemented in the inspected source.

## Related

- [System Overview](system-overview.md)
- [Cloudflare Pages Architecture](cloudflare-pages-architecture.md)
- [Implementation Status](../implementation/implementation-status.md)
