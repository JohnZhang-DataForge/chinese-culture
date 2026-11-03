# Future APIs, Data Models and Integrations

**Status:** Proposed — future design only.

## MVP decision

Use static content, human-reviewed GitHub changes and outbound links. **No runtime backend API, database, accounts or registration service is required to launch.**

## Cloudflare Free runtime boundary

If a dynamic endpoint is justified later, deploy it as a request-driven Cloudflare Worker using APIs supported by the Workers runtime. It is **not** an always-on Node.js VPS. Budget for Workers Free's 100,000 script requests/day, 10 ms CPU/request, 128 MB memory and 50 subrequests/request; revalidate exact published limits then. Normal articles and learning pages must stay static. See [the Cloudflare Free plan](06-cloudflare-free-node-deployment.md).

## When an API becomes justified

A requirement must identify the action impossible with static pages, a data owner, retention period, operational cost, abuse prevention, and a simpler alternative considered.

## Candidate future resources

- **Events:** searchable event details, dates, organizer and venue; possible curated submissions.
- **Newsletter:** opt-in subscription state, double opt-in and unsubscribe.
- **Feedback:** moderated corrections and editorial questions.
- **Learning progress:** user-specific data, only if accounts deliver a clear learning benefit.
- **Catalog search:** read-only indexed content if local static search becomes insufficient.

## Future OpenAPI approach

If any public or internal endpoint is approved, design the contract **before** implementation. Document resources, operations, field types, authentication, validation errors, pagination, privacy-sensitive data, abuse limits, examples and API versioning. Keep schemas and documentation under reviewed Git history.

## Data and privacy

Store the least possible personal data. Never add anonymous visitor identities, location tracking or registration data merely to improve analytics. Set retention and deletion policies before collecting anything.

## Decision gate

No API implementation starts until a new ADR approves the feature, threat model, estimated monthly spend and operational owner.
