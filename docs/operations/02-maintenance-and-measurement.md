# Maintenance, Reliability and Measurement

**Status:** Operational guidance for the current static site and proposed future CMS. No scheduled monitoring job or visitor analytics integration is verified in current main.

## Weekly checks

- Review GitHub Actions for failed CI or Pages deployment runs.
- Confirm the latest production Pages deployment references the expected main SHA.
- Check apex and www HTTPS/redirect behavior from an external workstation.
- Run \`npm run build\` and \`npm run verify\` after significant content or source changes.
- Check outbound editorial links and citations for obvious breakage.
- Review content correction requests and any upcoming public announcements.
- Keep the Events page as an empty state until event records have a verified source and process.

## Cloudflare Pages health

Monitor:

- Pages deployment success/failure and deployed source SHA.
- Apex and www Pages custom-domain status.
- Universal SSL certificate status and expiry.
- DNS CNAME target and proxy status.
- Redirect ruleset version and ACME path exclusions.
- Static asset count and individual file sizes checked by \`scripts/verify-static.mjs\`.

Current Pages production is static and reports \`uses_functions=false\`. There is no persistent Node.js process to monitor. The proposed Admin Worker is not deployed; if it is later released, add separate Worker request, error, CPU, quota and deployment monitoring.

Re-check official [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [limits](https://developers.cloudflare.com/workers/platform/limits/) before changing the runtime model.

## Monthly checks

- Review content freshness and corrections.
- Review domain renewal, registrar, Cloudflare zone and billing status.
- Review GitHub collaborator access and deployment-token necessity.
- Review Pages asset limits and repository growth.
- Confirm independent repository backup status if one has been configured.

## Quarterly checks

- Review topic gaps and editorial accuracy.
- Review accessibility issues and keyboard/mobile behavior.
- Review external links, citations and image licenses.
- Review security headers and dependency updates.
- Re-check whether any proposed dynamic feature is still justified.

## Event lifecycle

There is no event collection today. If one is implemented, verify organizer, date/time zone, location and registration URL before publication; re-check near the event date; mark canceled or completed events promptly; keep evergreen festival guides separate from dated event announcements.

## Measurement policy

The current site has no integrated analytics. Prefer privacy-conscious aggregate measurement if analytics are approved later. Avoid collecting unnecessary personal identifiers, IP-level profiles or persistent cross-site tracking.

## Incident response

For a bad release, stop further publication, assess whether public information or credentials are affected, restore the last-known-good Pages deployment or use a reviewed Git revert, correct the source and record lessons learned. See [Incident Recovery](incident-recovery.md).

## Ownership

Before enabling CMS publishing, explicitly assign maintainers for domain renewal, content approvals, Cloudflare access, GitHub access, Worker secrets and corrections. Do not invent owner identities in documentation.
