# Cloudflare Configuration

**Last verified:** 2026-11-05.  
**Purpose:** Record actual Cloudflare resources used by the site. Identifiers are not secrets; token values must never be documented.

## Account and zone

| Item | Value |
|---|---|
| Account ID | \`dff021f8489d2c316a14575c76de16d4\` |
| Zone | \`chinese-culture.site\` |
| Zone ID | \`e45789915a45279977315fb99f1fae11\` |
| Zone status | \`active\` |
| Zone plan | Free Website |
| Nameservers | \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\` |
| Registrar reported by Cloudflare | GoDaddy |

## Pages project

| Item | Value |
|---|---|
| Project name | \`chinese-culture\` |
| Project ID | \`7d79fba6-5fed-4f22-bce1-7e46dc5bfd06\` |
| Pages hostname | \`chinese-culture-79h.pages.dev\` |
| Production branch | \`main\` |
| Hosting mode | Direct Upload |
| Latest production deployment | \`ce2e7daa-86af-4f55-baed-80730b63e7c7\` |
| Deployment commit | \`539b37c9bfa5363f7149c95563bd549957eeff3d\` |
| Pages Functions | Disabled (\`uses_functions=false\`) |
| Compatibility date | \`2026-11-04\` |

## DNS records

| Name | Type | Target | Proxy |
|---|---|---|---|
| \`chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Proxied |
| \`www.chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Proxied |

## Pages custom-domain status

Both custom domains report active status:

| Hostname | Pages status | Verification | HTTP validation |
|---|---|---|---|
| \`chinese-culture.site\` | \`active\` | \`active\` | \`active\` |
| \`www.chinese-culture.site\` | \`active\` | \`active\` | \`active\` |

## TLS / SSL

- Zone SSL mode: \`Full\`.
- Universal SSL enabled: yes.
- Certificate pack ID: \`77a41fd9-ed00-4e22-8b23-9ccfbf111a1c\`.
- Certificate pack status: \`active\`.
- Covered hosts: \`chinese-culture.site\`, \`*.chinese-culture.site\`.
- Primary issuer: Let's Encrypt.
- Certificate expiry returned by API: \`2027-02-01T12:18:46Z\`.

## Redirect ruleset

Ruleset \`Chinese Culture hostname redirects\` (\`cd7bbdc493d24ff4a73fd0d1c5e8aaae\`) is enabled at version 4:

- \`www_to_apex_chinese_culture\`: 301 from www to HTTPS apex, preserving path and query.
- \`apex_http_to_https_chinese_culture\`: 301 from HTTP apex to HTTPS apex, preserving path and query.
- Both rules exclude \`/.well-known/acme-challenge/*\`.

## Repository deployment settings

- GitHub Actions secret: \`CLOUDFLARE_API_TOKEN\`.
- Account ID is embedded in the workflow; it is not a secret.
- Wrangler action: \`cloudflare/wrangler-action@v4\`.
- Deploy command: \`pages deploy dist --project-name=chinese-culture --branch=main\`.
- Build output: \`./dist\`.
- No Pages Functions, database bindings or Worker entrypoint are configured in current main.

## Verification caveat

Cloudflare API confirms Pages domain validation and active Universal SSL provisioning. Agent 1's cutover report could not complete independent HTTP/TLS checks because its execution environment could not resolve the tested hosts, including the existing pages.dev hostname. Complete external workstation smoke tests before claiming public response-chain verification.

## Future Admin Worker

Agent 0's Proposed architecture specifies a separate Worker for \`/api/admin/v1/*\`; it is not part of the current Pages project. Agent 5's backend branch currently contains Pages Functions, which conflicts with the proposal and must be reconciled before deployment.

## Operational links

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [GitHub Actions](https://github.com/JohnZhang-DataForge/chinese-culture/actions)
- [Pages project](https://dash.cloudflare.com/dff021f8489d2c316a14575c76de16d4/pages/view/chinese-culture)
- [DNS change log](domain-dns-change-log.md)
- [Deployment guide](../implementation/deployment-guide.md)

Re-read live Cloudflare configuration before making changes.
