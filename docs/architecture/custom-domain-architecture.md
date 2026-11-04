# Custom Domain Architecture

**Status:** Cloudflare configuration and Pages domain validation active; external HTTP/TLS smoke test not yet evidenced.  
**Last checked:** 2026-11-05.

## Hostname design

- Canonical hostname: \`https://chinese-culture.site\`.
- Alternate hostname: \`https://www.chinese-culture.site\`.
- Pages origin hostname: \`chinese-culture-79h.pages.dev\`.
- \`www\` permanently redirects to the apex.
- HTTP requests to the apex redirect to HTTPS.

~~~mermaid
flowchart TD
  A[Reader requests www] --> B[Cloudflare DNS]
  B --> C[Proxied CNAME to Pages]
  C --> D[301 to HTTPS apex]
  E[Reader requests apex over HTTP] --> F[301 to HTTPS apex]
  G[Reader requests apex over HTTPS] --> H[Cloudflare Pages project]
~~~

## Verified Cloudflare configuration

| Resource | Value |
|---|---|
| Zone | \`chinese-culture.site\` |
| Zone ID | \`e45789915a45279977315fb99f1fae11\` |
| Zone status | \`active\` |
| Nameservers | \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\` |
| Pages project | \`chinese-culture\` |
| Pages hostname | \`chinese-culture-79h.pages.dev\` |
| Apex CNAME | \`chinese-culture.site → chinese-culture-79h.pages.dev\` |
| WWW CNAME | \`www.chinese-culture.site → chinese-culture-79h.pages.dev\` |
| DNS proxy | Both CNAME records report \`proxied=true\` |

## Current Pages validation state

The latest Cloudflare Pages custom-domain API read returned:

| Hostname | Pages status | Verification | HTTP validation |
|---|---|---|---|
| \`chinese-culture.site\` | \`active\` | \`active\` | \`active\` |
| \`www.chinese-culture.site\` | \`active\` | \`active\` | \`active\` |

Cloudflare Universal SSL is active for \`chinese-culture.site\` and \`*.chinese-culture.site\`. The primary issuer is Let's Encrypt; the certificate expiry returned by the API is \`2027-02-01T12:18:46Z\`. Zone SSL mode is \`Full\`.

## Redirect ruleset

Cloudflare zone ruleset:

- Name: \`Chinese Culture hostname redirects\`.
- ID: \`cd7bbdc493d24ff4a73fd0d1c5e8aaae\`.
- Phase: \`http_request_dynamic_redirect\`.
- Version: \`4\`.

Enabled rules:

1. \`www_to_apex_chinese_culture\`: host \`www.chinese-culture.site\` → 301 to HTTPS apex; preserves path and query.
2. \`apex_http_to_https_chinese_culture\`: HTTP apex → HTTPS apex; preserves path and query.

Both rules explicitly exclude \`/.well-known/acme-challenge/*\` so Pages HTTP certificate validation requests are not redirected.

## External verification limitation

Cloudflare's API confirms domain validation and active certificate provisioning. The execution environment could not resolve the hostnames for an independent HTTP request, so no external HTTP 200/301 response or client TLS handshake is claimed. Complete the workstation smoke tests in [domain DNS change log](../operations/domain-dns-change-log.md) before marking the public cutover fully externally verified.

## Change safety

Before changing DNS, export or record existing records, confirm the Pages project and custom-domain mapping, and change only the intended hostname. Do not replace nameservers or delete unrelated records as routine troubleshooting.
