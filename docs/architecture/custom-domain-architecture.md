# Custom Domain Architecture

**Status:** DNS and Pages domain configuration exist; apex is active and \`www\` validation remains pending.  
**Last checked:** 2026-11-05.

## Hostname design

- Canonical hostname: \`https://chinese-culture.site\`.
- Alternate hostname: \`https://www.chinese-culture.site\`.
- Pages origin hostname: \`chinese-culture-79h.pages.dev\`.
- \`www\` is intended to redirect permanently to the apex hostname.

~~~mermaid
flowchart TD
  A[Reader requests www.chinese-culture.site] --> B[Cloudflare DNS]
  B --> C[Proxied CNAME to Pages hostname]
  C --> D[Enabled 301 redirect rule]
  D --> E[https://chinese-culture.site plus same path and query]
  F[Reader requests apex] --> G[Cloudflare DNS]
  G --> H[Proxied CNAME to Pages hostname]
  H --> I[Cloudflare Pages project]
~~~

## Verified Cloudflare configuration

| Resource | Value |
|---|---|
| Zone | \`chinese-culture.site\` |
| Zone ID | \`e45789915a45279977315fb99f1fae11\` |
| Zone status | \`active\` |
| Pages project | \`chinese-culture\` |
| Apex CNAME | \`chinese-culture.site → chinese-culture-79h.pages.dev\` |
| WWW CNAME | \`www.chinese-culture.site → chinese-culture-79h.pages.dev\` |
| DNS proxy | Both CNAME records report \`proxied=true\` |
| Nameservers | \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\` |

The apex and \`www\` CNAME records were created on 2026-11-04 at approximately 23:33 UTC. The Pages custom-domain records were created shortly beforehand.

## Current Pages validation state

The latest individual Pages domain reads returned:

| Hostname | Pages status | Verification | HTTP validation |
|---|---|---|---|
| \`chinese-culture.site\` | \`active\` | \`active\` | \`active\` |
| \`www.chinese-culture.site\` | \`pending\` | \`active\` | \`pending\` |

Do not describe both hostnames as fully active until the \`www\` validation completes. The Pages project itself has a successful production deployment on the \`pages.dev\` hostname.

## WWW redirect rule

Cloudflare zone ruleset:

- Name: \`Chinese Culture hostname redirects\`.
- Phase: \`http_request_dynamic_redirect\`.
- Rule: \`http.host eq "www.chinese-culture.site"\`.
- Action: 301 redirect to \`https://chinese-culture.site\` plus the original URI path.
- Query string: preserved.
- Rule enabled: yes.

The rule was read from the Cloudflare API; a DNS record comment alone would not prove that a redirect exists.

## Validation troubleshooting

Cloudflare Pages uses HTTP validation for these custom domains. Cloudflare's Pages troubleshooting guidance notes that Access policies, redirects, Workers or WAF rules can interfere with HTTP validation. Because the \`www\` hostname has a redirect rule and remains pending, investigate rather than assume the cause:

1. Read the current Pages domain status again.
2. Test the HTTP validation path for the pending hostname, for example \`curl -s -o /dev/null -D - https://www.chinese-culture.site/.well-known/acme-challenge/randomstring\`.
3. Check the response status and \`Location\` header. Confirm whether the validation request is being redirected.
4. Coordinate any temporary rule adjustment with the Cloudflare infrastructure owner. Do not disable or delete the rule speculatively.
5. Re-check Pages validation and certificate status after any approved change.

Official guidance: [Cloudflare Pages custom-domain troubleshooting](https://developers.cloudflare.com/pages/configuration/debugging-pages/) and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Change safety

Before changing DNS, export or record existing records, confirm the Pages project and custom-domain mapping, and change only the intended hostname. Do not replace nameservers or delete unrelated records as a routine troubleshooting step.
