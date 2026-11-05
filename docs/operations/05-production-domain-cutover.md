# Production Domain and Cloudflare Pages Cutover

**Date:** 2026-11-05  
**Owner:** Agent 1 — Cloudflare Infrastructure and Domain Engineer  
**Repository:** `JohnZhang-DataForge/chinese-culture`  
**Branch:** `agent/01-cloudflare-domain`

## Executive summary

The production apex domain and `www` hostname are attached to the existing Cloudflare Pages project. Cloudflare DNS records, the hostname-specific redirect ruleset, Pages domain validation, and the zone certificate inventory have been configured and checked through the authenticated Cloudflare API.

No application source, Pages project, or existing `pages.dev` hostname was deleted or recreated.

Cloudflare reports both Pages custom domains as `active`, and both HTTP validation records as `active`. The zone's active Universal SSL certificate covers the apex and wildcard hostnames. The actual public HTTP response/redirect chain and a TLS handshake could not be independently exercised from the current execution environment because its network resolver could not resolve any of the three tested hosts (including the existing `pages.dev` hostname). Treat the Cloudflare API evidence below as configuration/provisioning evidence, not as a substitute for the remaining external HTTP smoke test.

## Verified resources

| Resource | Value |
|---|---|
| Cloudflare account | `dff021f8489d2c316a14575c76de16d4` |
| Zone | `chinese-culture.site` |
| Zone ID | `e45789915a45279977315fb99f1fae11` |
| Zone status | `active` |
| Zone paused | `false` |
| Nameservers | `aleena.ns.cloudflare.com`, `trevor.ns.cloudflare.com` |
| Zone plan | Free Website |
| Pages project | `chinese-culture` |
| Pages project ID | `7d79fba6-5fed-4f22-bce1-7e46dc5bfd06` |
| Existing Pages hostname | `chinese-culture-79h.pages.dev` |
| Production branch | `main` |

The latest Pages deployment is production deployment `ce2e7daa-86af-4f55-baed-80730b63e7c7`, from commit `539b37c9bfa5363f7149c95563bd549957eeff3d`. Cloudflare reports its deploy stage as `success`.

## Pre-change audit

Before making changes, the zone had no DNS records. The Pages project existed and retained its original `chinese-culture-79h.pages.dev` hostname, but neither requested custom hostname was attached.

The Pages project and zone identifiers matched the handoff values. The zone was active and on the Free plan.

## Changes applied

### 1. Pages custom domains

Used the Pages custom-domain integration on the existing project:

| Hostname | Pages domain ID | Final API status | Verification | HTTP validation |
|---|---|---|---|---|
| `chinese-culture.site` | `9e4fa615-1401-4adf-875f-d095d7c5f116` | `active` | `active` | `active` |
| `www.chinese-culture.site` | `1583416a-1d9a-4969-bf55-1665083100ac` | `active` | `active` | `active` |

Both records report `validation_data.method = http`. Both custom domains remain attached to the same Pages project.

### 2. DNS records

Created only the two requested records. No unrelated records existed or were changed.

| Hostname | Type | Target | Proxy | TTL | Record ID |
|---|---|---|---|---|---|
| `chinese-culture.site` | CNAME (zone-apex flattening handled by Cloudflare) | `chinese-culture-79h.pages.dev` | Proxied | Auto | `7d593d2db50c78d43f282713efefcd02` |
| `www.chinese-culture.site` | CNAME | `chinese-culture-79h.pages.dev` | Proxied | Auto | `8cb954cfb3acc5d9d6144ffb41d2c151` |

### 3. Canonical redirects

Created a zone-level Single Redirect ruleset:

- Ruleset: `Chinese Culture hostname redirects`
- Ruleset ID: `cd7bbdc493d24ff4a73fd0d1c5e8aaae`
- Phase: `http_request_dynamic_redirect`
- Latest ruleset version: `4`

Rules:

1. **www to apex**
   - Ref: `www_to_apex_chinese_culture`
   - Rule ID: `fca612ff26df4dbbb2b2a47474fc207f`
   - Match: `http.host eq "www.chinese-culture.site"`
   - Excludes `/.well-known/acme-challenge/*` so Pages certificate validation is not intercepted.
   - Redirects to `https://chinese-culture.site` plus the original path.
   - HTTP status: `301`; query string preserved.

2. **apex HTTP to HTTPS**
   - Ref: `apex_http_to_https_chinese_culture`
   - Rule ID: `10993097f0ac466382d61169dde78a6e`
   - Matches HTTP requests for the apex hostname.
   - Excludes `/.well-known/acme-challenge/*`.
   - Redirects to the HTTPS apex plus the original path.
   - HTTP status: `301`; query string preserved.

The ruleset was accepted by Cloudflare's dry-run validation before the final update. The broad zone setting `always_use_https` remains off; the hostname-specific rules implement HTTPS canonicalization while preserving the Pages ACME validation path.

### 4. SSL and certificate evidence

Cloudflare zone SSL/TLS mode is `Full`. The zone setting reports `certificate_status = active`.

The production Universal SSL certificate-pack API reports:

- Pack type: `universal`
- Pack status: `active`
- Hosts: `chinese-culture.site`, `*.chinese-culture.site`
- Primary issuer: Let's Encrypt
- Certificate status: `active`
- Certificate expiry: `2027-02-01T12:18:46Z`

A Google Trust Services backup certificate pack is also present with status `backup_issued`, covering the same hostnames.

The Pages custom-domain API independently reports both hostnames as `active` with HTTP validation `active`. These are positive Cloudflare provisioning signals. A client-side TLS handshake was not available from this execution environment and is still part of the external smoke test.

## Verification matrix

| Check | Result | Evidence / limitation |
|---|---|---|
| Cloudflare account and zone | PASS | Authenticated API returned the expected account and zone; zone active. |
| Existing Pages project | PASS | Project ID and name match the handoff. |
| Existing `pages.dev` hostname preserved | PASS (configuration) | Project still lists `chinese-culture-79h.pages.dev`; no project deletion or recreation. |
| Apex Pages custom domain | PASS (Cloudflare validation) | Pages API status, verification and HTTP validation are all active. |
| www Pages custom domain | PASS (Cloudflare validation) | Pages API status, verification and HTTP validation are all active. |
| DNS configuration | PASS (Cloudflare configuration) | Both proxied CNAME records are present and target the existing Pages hostname. |
| Certificate provisioning | PASS (Cloudflare API) | Active Universal SSL pack covers apex and wildcard; Pages domains report active. |
| www permanent redirect rule | CONFIGURED; external response not tested | 301 rule exists, preserves path/query, excludes ACME validation path. |
| apex HTTP to HTTPS rule | CONFIGURED; external response not tested | 301 rule exists, preserves path/query, excludes ACME validation path. |
| Apex HTTPS returns HTTP 200 | NOT VERIFIED | Execution environment could not resolve public hosts. |
| www HTTPS returns 301 to apex | NOT VERIFIED | Execution environment could not resolve public hosts. |
| HTTP redirect chain | NOT VERIFIED | Execution environment could not resolve public hosts. |
| `pages.dev` HTTP 200 | NOT VERIFIED | Execution environment could not resolve public hosts. |
| Major route smoke tests | NOT VERIFIED LIVE | Static build/CI checks are separate; no live HTTP fetch was possible here. |

### Network test limitation

Attempted `curl -I` against:

- `https://chinese-culture.site/`
- `https://www.chinese-culture.site/`
- `https://chinese-culture-79h.pages.dev/`
- HTTP variants of the apex and www hostnames.

The execution container returned `Could not resolve host` for all three hostnames, including the pre-existing Pages hostname. This indicates the test environment's DNS/network limitation; it does not establish that the public zone is broken. Direct web fetches were also unavailable from the current browser fetch cache. No HTTP 200, 301, or TLS handshake is claimed here.

## External smoke test to complete

Run these commands from a normal workstation or external network after DNS propagation:

```powershell
Resolve-DnsName chinese-culture.site -Type A
Resolve-DnsName www.chinese-culture.site -Type A

curl.exe -sSI https://chinese-culture.site/
curl.exe -sSI "https://www.chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI "http://www.chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI "http://chinese-culture.site/learn/?source=domain-test"
curl.exe -sSI https://chinese-culture-79h.pages.dev/

# Follow the full redirect chain for the www hostname.
curl.exe -sSIL "https://www.chinese-culture.site/learn/?source=domain-test"
```

Expected results:

- `https://chinese-culture.site/` returns `200`.
- `https://www.chinese-culture.site/learn/?source=domain-test` returns `301` to `https://chinese-culture.site/learn/?source=domain-test`.
- `http://www.chinese-culture.site/learn/?source=domain-test` returns `301` to the same HTTPS apex URL.
- `http://chinese-culture.site/learn/?source=domain-test` returns `301` to the HTTPS apex URL.
- `https://chinese-culture-79h.pages.dev/` remains available.
- Check representative routes such as `/learn/`, `/culture/`, `/festivals/`, `/books/`, `/events/`, and `/about/` for HTTP 200 on the apex.

## Coordination notes

- No application code was changed.
- No Pages project was deleted or recreated.
- Existing `pages.dev` remains listed on the same project.
- This report is the configuration evidence for Agent 0 and Agent 7 to incorporate into the project documentation.
- The current root `README.md` and `docs/README.md` still contain older wording that says production deployment/domain setup is pending. Agent 0 / Agent 7 should reconcile those status statements with the latest deployment and this domain evidence.
- No additional Cloudflare permission or manual authorization is currently required for the changes completed through the connected account.
