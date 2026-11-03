# Success Metrics, Assumptions and Budget

**Status:** Proposed

## Success measures

Evaluate whether people learn and return, not just raw views.

| Signal | Interpretation | Initial cadence |
|---|---|---|
| Published reviewed lessons | Reliable launch depth | Weekly during launch |
| Broken links / expired events | Content freshness | Weekly |
| Reading completion proxies | Content usefulness, aggregate only | Monthly |
| Search queries leading to lessons | Discoverability | Monthly |
| Feedback and correction turnaround | Trust and editorial responsiveness | Monthly |
| Accessibility defects | Usability quality | Per release |
| Hosting and domain spend | Sustainability | Monthly |

Define actual numeric targets after establishing a baseline; do not fabricate traffic forecasts.

## Cost assumptions

- **Hosting:** target **Cloudflare Workers Free + Static Assets**, with $0/month for website hosting when all normal page views are static; no always-on Node.js server.
- **Domain:** optional and generally paid; record annual price and renewal owner.
- **Repository:** private GitHub repository under plan permissions.
- **Media:** compress and host responsibly; avoid costly unbounded video storage.
- **Analytics:** start with privacy-conscious aggregate metrics or no analytics.
- **Email, search, databases and registrations:** optional future operating costs.

## Cloudflare Free budget baseline (November 2026)

Static asset requests are free and unlimited. Worker script invocations are separately subject to 100,000 requests/day and 10 ms of CPU per request on Workers Free; other limits include 128 MB memory, 50 subrequests per request, 20,000 static files per version and 25 MiB per individual asset. These limits must be rechecked before launch; any future dynamic features may exceed them. Cloudflare hosting is separate from possible domain-registration expenses. See [the detailed Cloudflare plan](../architecture/06-cloudflare-free-node-deployment.md) and [official limits](https://developers.cloudflare.com/workers/platform/limits/).

## Guardrails

- No credit-card-required add-ons by default without owner approval.
- Check current Cloudflare and GitHub plan limits before choosing deployment.
- Configure spend limits or monitoring before enabling paid services.
- Review feature requests for ongoing maintenance costs and API usage.

## Prelaunch financial decision

Record domain ownership, annual budget ceiling, billing contacts, and whether the site will ever run sponsorship or affiliate links.
