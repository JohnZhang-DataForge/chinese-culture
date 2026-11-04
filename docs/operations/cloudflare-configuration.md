# Cloudflare Configuration

**Last verified:** 2026-11-05.  
**Purpose:** Record the actual Cloudflare resources used by the site. Identifiers are not secrets; token values must never be documented.

## Account and zone

| Item | Value |
|---|---|
| Account ID | \`dff021f8489d2c316a14575c76de16d4\` |
| Zone | \`chinese-culture.site\` |
| Zone ID | \`e45789915a45279977315fb99f1fae11\` |
| Zone status | \`active\` |
| Cloudflare nameservers | \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\` |
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

The successful deployment was created at \`2026-11-04T23:15:15Z\`; its deploy stage completed successfully at \`2026-11-04T23:15:17Z\`.

## DNS records

| Name | Type | Target | Proxy |
|---|---|---|---|
| \`chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Proxied |
| \`www.chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Proxied |

## Custom-domain status

- \`chinese-culture.site\`: Pages domain status \`active\`; verification \`active\`; HTTP validation \`active\`.
- \`www.chinese-culture.site\`: Pages domain status \`pending\`; verification \`active\`; HTTP validation \`pending\`.

The enabled redirect ruleset \`Chinese Culture hostname redirects\` returns 301 from \`www\` to the apex, preserving path and query string. Cloudflare's Pages troubleshooting guidance notes that redirects can interfere with HTTP validation. If \`www\` remains pending, inspect the ACME HTTP validation response and coordinate with the infrastructure owner before changing the rule.

## Repository deployment settings

- GitHub Actions secret: \`CLOUDFLARE_API_TOKEN\`.
- The workflow embeds the account ID; it is not a secret.
- Wrangler action: \`cloudflare/wrangler-action@v4\`.
- Deploy command: \`pages deploy dist --project-name=chinese-culture --branch=main\`.
- Build output directory: \`./dist\`.
- No Pages Functions, database bindings or Worker entrypoint are configured.

## Operational links

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [GitHub Actions](https://github.com/JohnZhang-DataForge/chinese-culture/actions)
- [Pages project](https://dash.cloudflare.com/dff021f8489d2c316a14575c76de16d4/pages/view/chinese-culture)
- [DNS change log](domain-dns-change-log.md)
- [Deployment guide](../implementation/deployment-guide.md)

Re-read the live Cloudflare configuration before making a change. Do not assume this snapshot remains current indefinitely.
