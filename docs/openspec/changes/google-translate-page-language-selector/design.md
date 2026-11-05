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
