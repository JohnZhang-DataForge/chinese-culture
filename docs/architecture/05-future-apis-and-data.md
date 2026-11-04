# Future APIs, Data Models and Integrations

**Status:** Public dynamic APIs and databases remain out of scope. A private Admin API is proposed in Agent 0 OpenSpec PR #3 but is not Ready or implemented in current \`main\`.

## Current MVP decision

The public site is static Astro content, human-reviewed GitHub changes and outbound links. No runtime database, public API, reader accounts, registration service or event submission system is deployed.

## Proposed private Admin API

Agent 0's Proposed design introduces a same-origin Admin API at \`/api/admin/v1/*\`, served by a **separate Cloudflare Worker**, protected by Cloudflare Access and backed by a least-privilege GitHub App. The API manages Git-backed drafts, previews, media and PR submissions. It does not serve normal public pages, write directly to \`main\` or merge PRs.

This is not the same as a public content API and does not require a database. The shared API contract is in Agent 0 PR #3; do not implement against it until Agent 0 marks it Ready.

## Runtime boundary

Keep public pages static on Cloudflare Pages. The proposed Admin Worker is request-driven and separate from the Pages project. Do not add Pages Functions or SSR to the public project as a substitute for the agreed separate Worker architecture.

Re-check Cloudflare's current published pricing and limits before adding any runtime service. Normal articles and learning pages must remain readable if the Admin Worker is unavailable.

## Candidate future resources outside the current scope

- **Events:** searchable event details, dates, organizer and venue; not implemented.
- **Newsletter:** opt-in subscription state, double opt-in and unsubscribe; not approved.
- **Feedback:** moderated corrections and editorial questions; not implemented.
- **Learning progress:** user-specific data; out of scope without a separate privacy/security design.
- **Public catalog API:** not required by the current site.

## Data and privacy

Store the least possible personal data. Do not add anonymous visitor identities, location tracking, registration data or behavioral analytics merely to improve metrics. Set retention and deletion policies before collecting personal information.

## Decision gate

Any additional API/data service requires a reviewed architecture decision, threat model, data owner, retention policy, abuse controls, cost estimate and operational owner. Changes to Agent 0's proposed Admin API must follow its versioned contract process.
