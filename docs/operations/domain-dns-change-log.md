# Domain and DNS Change Log

This file records verified domain changes for the Chinese Culture Atlas site. Times below are UTC as returned by Cloudflare.

## 2026-11-03 — Zone activation

- Zone: \`chinese-culture.site\`.
- Zone ID: \`e45789915a45279977315fb99f1fae11\`.
- Zone status: \`active\`.
- Cloudflare nameservers: \`aleena.ns.cloudflare.com\`, \`trevor.ns.cloudflare.com\`.
- Previous nameservers returned by Cloudflare: \`ns53.domaincontrol.com\`, \`ns54.domaincontrol.com\`.
- Original registrar returned by Cloudflare: GoDaddy.
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

Both records were created at approximately \`2026-11-04T23:33:13Z\`.

## 2026-11-04 — WWW to apex redirect rule created

Cloudflare zone ruleset:

- Name: \`Chinese Culture hostname redirects\`.
- Ruleset ID: \`cd7bbdc493d24ff4a73fd0d1c5e8aaae\`.
- Phase: \`http_request_dynamic_redirect\`.
- Enabled rule: \`www_to_apex_chinese_culture\`.
- Match: host equals \`www.chinese-culture.site\`.
- Action: HTTP 301 to \`https://chinese-culture.site\` plus the original path.
- Query string is preserved.
- Last updated: \`2026-11-04T23:33:23Z\`.

## 2026-11-05 — Validation status rechecked

Latest individual Pages custom-domain reads:

| Hostname | Pages status | Verification | HTTP validation |
|---|---|---|---|
| \`chinese-culture.site\` | \`active\` | \`active\` | \`active\` |
| \`www.chinese-culture.site\` | \`pending\` | \`active\` | \`pending\` |

The apex hostname is active. The \`www\` custom domain still needs validation. Do not record the two hostnames as equally active.

## Change procedure for future edits

Before changing a record:

1. Read the current zone and DNS record.
2. Confirm the exact hostname, record type, target and proxy status.
3. Record the existing record ID and value.
4. Change only the intended record.
5. Re-read the record and Pages custom-domain state.
6. Test DNS resolution, HTTPS and redirects.
7. Add a dated entry here with the reason and evidence.

Never store API tokens or private credentials in this log.
