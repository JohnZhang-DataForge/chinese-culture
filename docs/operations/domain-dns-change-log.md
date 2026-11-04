# Domain and DNS Change Log

Times below are UTC as returned by Cloudflare. This log records configuration evidence, not a claim that every external client has completed an HTTP/TLS smoke test.

## 2026-11-03 — Zone activation

- Zone: \`chinese-culture.site\`.
- Zone ID: \`e45789915a45279977315fb99f1fae11\`.
- Zone status: \`active\`.
- Cloudflare nameservers: \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\`.
- Previous nameservers returned by Cloudflare: \`ns53.domaincontrol.com\`, \`ns54.domaincontrol.com\`.
- Registrar reported by Cloudflare: GoDaddy.
- Zone activation timestamp: \`2026-11-03T13:16:13Z\`.

## 2026-11-04 — Pages custom domains added

Pages project: \`chinese-culture\`.

- Project ID: \`7d79fba6-5fed-4f22-bce1-7e46dc5bfd06\`.
- Pages hostname: \`chinese-culture-79h.pages.dev\`.
- Apex custom domain created: \`2026-11-04T23:32:21Z\`.
- WWW custom domain created: \`2026-11-04T23:32:22Z\`.

## 2026-11-04 — DNS CNAME records created

| Hostname | Type | Target | Proxied | Record ID |
|---|---|---|---:|---|
| \`chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Yes | \`7d593d2db50c78d43f282713efefcd02\` |
| \`www.chinese-culture.site\` | CNAME | \`chinese-culture-79h.pages.dev\` | Yes | \`8cb954cfb3acc5d9d6144ffb41d2c151\` |

Both records were created at approximately \`2026-11-04T23:33:13Z\`. No unrelated DNS records were changed in the cutover report.

## 2026-11-04 — Canonical redirect rules created and refined

Cloudflare zone ruleset:

- Name: \`Chinese Culture hostname redirects\`.
- Ruleset ID: \`cd7bbdc493d24ff4a73fd0d1c5e8aaae\`.
- Phase: \`http_request_dynamic_redirect\`.
- Latest observed version: \`4\`.
- Last updated: \`2026-11-04T23:37:11.329947Z\`.

Enabled rules:

1. **WWW to apex**
   - Ref: \`www_to_apex_chinese_culture\`.
   - Rule ID: \`fca612ff26df4dbbb2b2a47474fc207f\`.
   - Match: host equals \`www.chinese-culture.site\`, except \`/.well-known/acme-challenge/*\`.
   - Action: 301 to \`https://chinese-culture.site\` plus original path.
   - Query string preserved.

2. **Apex HTTP to HTTPS**
   - Ref: \`apex_http_to_https_chinese_culture\`.
   - Rule ID: \`10993097f0ac466382d61169dde78a6e\`.
   - Match: HTTP requests for apex, except \`/.well-known/acme-challenge/*\`.
   - Action: 301 to the HTTPS apex plus original path.
   - Query string preserved.

The ACME path exclusion is intentional: it allows Pages HTTP certificate validation requests to pass without being redirected.

## 2026-11-05 — Pages domain and certificate status rechecked

Latest individual Pages domain reads and list response:

| Hostname | Pages status | Verification | HTTP validation |
|---|---|---|---|
| \`chinese-culture.site\` | \`active\` | \`active\` | \`active\` |
| \`www.chinese-culture.site\` | \`active\` | \`active\` | \`active\` |

Cloudflare Universal SSL:

- Certificate pack ID: \`77a41fd9-ed00-4e22-8b23-9ccfbf111a1c\`.
- Type: \`universal\`.
- Status: \`active\`.
- Hosts: \`chinese-culture.site\`, \`*.chinese-culture.site\`.
- Primary issuer: Let's Encrypt.
- Certificate expiry returned by API: \`2027-02-01T12:18:46Z\`.
- Zone SSL mode: \`Full\`.

## External smoke-test limitation

Cloudflare API configuration and validation are active, but the Agent 1 cutover report records that its execution environment could not resolve the apex, www or existing pages.dev hostname for independent HTTP/TLS checks. The current browser fetch environment also did not provide a successful live HTTP response. Therefore do not claim external 200/301/TLS verification until it is run from a normal workstation or external network.

Suggested PowerShell checks:

~~~powershell
Resolve-DnsName chinese-culture.site -Type A
Resolve-DnsName www.chinese-culture.site -Type A

curl.exe -sSI https://chinese-culture.site/
curl.exe -sSI "https://www.chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI "http://www.chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI "http://chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI https://chinese-culture-79h.pages.dev/
curl.exe -sSIL "https://www.chinese-culture.site/learn/?source=domain-test"
~~~

Expected: apex HTTPS returns 200; www HTTPS and HTTP redirect to the equivalent HTTPS apex URL with path/query preserved; apex HTTP redirects to HTTPS; pages.dev remains available.

## Future change procedure

1. Read the current zone and record.
2. Confirm hostname, record type, target and proxy status.
3. Record the existing record ID and value.
4. Change only the intended record/rule.
5. Re-read Pages domain and certificate status.
6. Run DNS and external HTTPS/redirect tests.
7. Add a dated entry with reason, evidence and rollback details.

Never store API tokens or private keys in this log.
