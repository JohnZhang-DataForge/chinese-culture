# Design: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector  
**Status:** Direct translated-site URL correction in progress

## Architecture

The static Astro site remains on Cloudflare Pages Free. The browser constructs a Google-hosted translated-page URL and navigates directly to the translated page. No project API, Pages Function, API key or database is involved.

## Hostname encoding

Google's translated URL convention replaces hostname dots with hyphens and doubles literal hyphens. For this site's production hostname:
- Source: `chinese-culture.site`
- Encoded: `chinese--culture-site`
- Translation host: `chinese--culture-site.translate.goog`

A single hyphen would decode as `chinese.culture.site`, not `chinese-culture.site`.

## Query parameters

- `_x_tr_sl=auto`: detect the source language.
- `_x_tr_tl=<target>`: selected translation language.
- `_x_tr_hl=en`: Google translation interface language.
- `_x_tr_pto=wapp`: translated website web-app mode.

Existing source query parameters are retained. Existing `_x_tr_*` parameters are removed before adding translation parameters.

## Component behavior

The shared `GoogleTranslate.astro` selector stays visually unchanged. Its change handler navigates directly to the translated-page URL. The reader no longer lands on the Google Translate Websites form with an empty Website field.

## Privacy and limitations

Selecting a language sends the visitor to Google's translated-site infrastructure. Google may retrieve and process the public page content. The privacy notice links to Google's policy.

Google documents the translated-page hostname convention in its [Search Central translation documentation](https://developers.google.com/search/docs/appearance/ad-network-and-translation). Directly constructing these URLs is not a guaranteed public translation API; Google can change or restrict this behavior.

## Validation

- Test the site's hyphenated production hostname.
- Test subdomains and literal hyphens in source hostnames.
- Test path, query and fragment preservation.
- Reject unsupported protocols, local-only hostnames and custom ports.
- Run `npm run build` and `npm run verify`.
- Perform a real-browser test that confirms the translated page loads.


## 7. Switching languages from a translated page

The translated Google-hosted page keeps the site's shared language selector. When the visitor chooses another language, the current browser hostname already ends in `.translate.goog`. Treating that hostname as the original site would create a proxy-of-a-proxy URL and Google may reject it.

Before constructing a new translation URL, decode the Google proxy hostname:
- Strip the `.translate.goog` suffix.
- Decode each doubled hyphen (`--`) as a literal hyphen.
- Decode each remaining single hyphen (`-`) as a hostname dot.
- If a previously generated nested proxy is encountered, repeat decoding until the original public hostname is recovered, with a bounded layer count.
- Re-encode the recovered original hostname and apply only the newly selected target language.
- Preserve the page path, ordinary query parameters and fragment; remove old `_x_tr_*` routing parameters before adding the new set.

This makes language changes idempotent: selecting a different language from a Google-translated page reuses the same translated host rather than nesting another proxy.
