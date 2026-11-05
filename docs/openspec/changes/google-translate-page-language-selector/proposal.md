# Proposal: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector  
**Status:** Direct translated-site URL correction in progress  
**Target:** https://chinese-culture.site  
**Hosting constraint:** Astro static output on Cloudflare Pages Free

## Why

The first production implementation opened the Google Translate Websites interface with a URL supplied in the `text` query parameter. A real browser test showed that Google displayed the Websites tab but left its Website field empty. The `text` parameter is not a supported prefill contract for that field, so the prior acceptance claim was incorrect.

## Outcomes

1. Keep the compact, accessible, site-wide **Select Language** dropdown.
2. On selection, navigate directly to the Google-hosted translated-site URL for the current page and target language.
3. Preserve the current path, original query parameters and fragment.
4. Keep the manually maintained English and Simplified Chinese editions authoritative.
5. Avoid the retired embedded Website Translator widget and avoid paid Cloud Translation API dependencies.

## Normative requirements

- **TRN-001:** The selector SHALL be available from the shared public layout on desktop and mobile.
- **TRN-002:** The control SHALL use a native HTML select with an accessible name and initial `Select Language` option.
- **TRN-003:** A valid selection SHALL navigate directly to a hostname under the Google translated-site domain, with `_x_tr_sl=auto`, selected `_x_tr_tl`, `_x_tr_hl=en`, and `_x_tr_pto=wapp`.
- **TRN-004:** The translated hostname SHALL encode source hostname dots as hyphens and literal hostname hyphens as double hyphens.
- **TRN-005:** The source path, query parameters and fragment SHALL be preserved.
- **TRN-006:** The URL builder SHALL reject non-HTTP(S), local-only, port-qualified and unsupported hostnames rather than generate a malformed translation URL.
- **TRN-007:** The selector SHALL NOT load `translate_a/element.js` or call `google.translate.TranslateElement`.
- **TRN-008:** No Google Cloud API key, paid service, Pages Function, database or runtime server SHALL be required.
- **TRN-009:** The privacy notice SHALL disclose that the selected page is served through Google's translation infrastructure.
- **TRN-010:** The original website and native locale routes SHALL remain readable if the external Google translation route is unavailable.

## External behavior and limitation

Google documents the translated-page hostname convention and how to map translated URLs back to source hostnames in its [Search Central translation documentation](https://developers.google.com/search/docs/appearance/ad-network-and-translation). This implementation uses that Google-hosted URL convention. It is not a supported public translation API or a guaranteed stable integration; Google may change or restrict it.

## Acceptance criteria

1. The selector appears on all public pages.
2. Selecting Catalan for the production homepage generates the Google-hosted translated-page URL for `chinese-culture.site`.
3. The target URL does not contain `op=translate`, `op=websites` or a `text` field that leaves the Website input blank.
4. URL-builder tests verify host encoding, path, query, fragment, target language and invalid inputs.
5. Astro build and static verification pass.
6. A real browser test confirms the translated page loads, rather than an empty Google Translate input screen.
