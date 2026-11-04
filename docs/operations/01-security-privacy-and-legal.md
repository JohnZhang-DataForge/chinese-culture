# Security, Privacy, Copyright and Responsible Publishing

**Status:** Operating principles for the deployed static MVP and future features. This is not legal advice.

## Current security baseline

The current public website is static. The inspected main branch has no visitor accounts, login, contact form, newsletter, integrated analytics, runtime database or Admin API.

\`public/_headers\` configures:
- \`X-Content-Type-Options: nosniff\`
- \`Referrer-Policy: strict-origin-when-cross-origin\`
- \`X-Frame-Options: DENY\`
- \`Permissions-Policy: camera=(), microphone=(), geolocation=()\`

The checked file does not configure CSP or HSTS. Main branch protection must be verified; Agent 0's baseline inspection reported it was not protected.

Keep GitHub private with least-privilege collaborators, account MFA, reviewed changes and restricted deployment credentials. Never expose internal documentation, tokens or private keys in public assets.

## Privacy baseline

The current privacy page says the application does not intentionally set cookies and does not include visitor accounts, newsletter subscriptions, contact forms or integrated analytics. Cloudflare may process ordinary request information for security and delivery.

If a contact mechanism or analytics is added, update the privacy notice to reflect the actual deployed service, data collected, purpose, recipient, retention and user rights before enabling it.

## Copyright and media rights

Use original writing and content for which adequate permissions exist. Verify image licenses, attribution and modification requirements. Do not assume ancient original works make modern translations, illustrations or editions free to distribute.

The proposed CMS media contract requires alt text, credit and license metadata for every published image. It is not implemented in current main.

## Cultural responsibility

Distinguish legend from documented history, avoid essentializing a diverse population, describe cultural variation and seek qualified review where sources or traditions are contested.

## Outbound links and events

Check organizer legitimacy and avoid presenting third-party promotions as endorsements. Clearly state when an event is independent of the site. The current Events page is a static empty state; no event listings are published.

## Advertising and sponsorship

If introduced later, mark paid placements and affiliate relationships clearly, preserve editorial independence and avoid behavioral tracking by default.

## Future Admin security

Agent 0's Proposed design calls for Cloudflare Access, a separate Worker, server-side JWT verification, CSRF/origin validation and GitHub App credentials held server-side. These controls must be implemented and tested before exposing an admin path.

See [Security Operations](security-operations.md) and [Admin Credential Setup](admin-credential-setup.md).
