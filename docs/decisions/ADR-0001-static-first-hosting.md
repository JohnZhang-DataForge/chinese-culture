# ADR-0001: Static-first Hosting on Cloudflare

**Status:** Proposed

## Context

A cultural education site initially publishes articles, lessons, book guides and curated event announcements. Most content changes only when editors publish new material. The project aims to minimize recurring costs and operational complexity.

## Decision

Use a static-first website, tentatively Astro with Cloudflare Workers Static Assets. Keep editorial Markdown under GitHub review. Avoid a database and long-running application server for MVP.

## Consequences

**Positive:** lower operational overhead, CDN caching, simpler security boundaries, improved resilience and potentially free hosting at modest traffic.

**Negative:** no built-in user accounts, server-side personalization, native event registrations or dynamic editorial portal. Some publication tasks remain developer/editor-assisted.

## Alternatives considered

- Traditional CMS with managed database: easier nontechnical editing but added operating cost/security concerns.
- Always-on app server: unnecessary for a content-first MVP.
- Cloudflare Pages: a viable alternative to re-evaluate using current Cloudflare documentation at implementation time.

## Review trigger

Revisit if editors cannot reasonably manage Git-based publishing, if dynamic features become central, or if provider terms/pricing materially change.
