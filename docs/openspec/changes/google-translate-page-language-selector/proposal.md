# Proposal: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector  
**Status:** Proposed for implementation  
**Target:** https://chinese-culture.site  
**Hosting constraint:** Astro static output on Cloudflare Pages Free

## Why

Readers may want to read an individual page in a language beyond the site's maintained English and Simplified Chinese editions. The requested experience is the familiar compact **Select Language** dropdown with Google Translate attribution.

Google's legacy Website Translator embed is no longer supported as of October 1, 2026. The project must not introduce that retired script as a new dependency or present it as a supported integration. Google continues to provide website translation through Google Translate itself.

## Outcomes

1. Add a compact, accessible, site-wide language dropdown labelled **Select Language**.
2. Offer common target languages without requiring an API key or server-side translation service.
3. When a reader selects a language, open Google Translate's website-translation view for the current page URL.
4. Preserve the original page URL in the translation request so readers can translate the page they are currently viewing.
5. Keep the existing and future human-maintained `/en/` and `/zh-cn/` routes as the authoritative editions.
6. Disclose that the optional translation flow is handled by Google and may contain machine-translation errors.

## Normative requirements

- **TRN-001:** The selector SHALL be available from the shared public layout on desktop and mobile.
- **TRN-002:** The control SHALL use a native HTML select element with an accessible name and an initial `Select Language` option.
- **TRN-003:** A valid language selection SHALL navigate to Google Translate's website translation URL with `sl=auto`, the selected `tl`, and the current page URL in `u`.
- **TRN-004:** The URL SHALL be assembled using the platform URL API so the current path, query and fragment are encoded safely.
- **TRN-005:** The selector SHALL NOT load `translate_a/element.js`, call `google.translate.TranslateElement`, or depend on the unsupported legacy Website Translator widget.
- **TRN-006:** The implementation SHALL NOT require Google Cloud Translation API credentials, paid services, a database, Pages Functions or a runtime server.
- **TRN-007:** The control SHALL identify Google Translate as the external translation provider without implying that the legacy embedded widget is installed.
- **TRN-008:** The site's manually maintained English and Simplified Chinese content and language switcher SHALL remain unchanged and authoritative.
- **TRN-009:** The privacy notice SHALL explain that selecting Google translation sends the page URL to Google and opens Google's translation service; Google's own processing is governed by Google's terms and privacy policy.
- **TRN-010:** If JavaScript is unavailable or the external service changes, the site SHALL remain fully readable in its original language and the native language routes SHALL continue to work.

## Out of scope

- Translating and storing additional locale content in the repository.
- Search-indexable machine-translated locale routes or hreflang entries for generated translations.
- Google Cloud Translation API integration, API billing, translation caching or editorial review workflows.
- Replacing the site's human-maintained English / Simplified Chinese language switcher.
- Embedding the retired Google Website Translator JavaScript widget.

## Acceptance criteria

1. The dropdown appears on every public page through the shared layout.
2. The dropdown is keyboard-operable and has a programmatic accessible name.
3. Selecting a language constructs a Google Translate URL containing the current page URL and selected target language.
4. The implementation does not request the retired `translate_a/element.js` script.
5. Static build and verification pass with no SSR Worker or additional Cloudflare resource.
6. The privacy page accurately describes the optional third-party translation flow.
7. Desktop and mobile layouts remain usable.
8. A manual browser check confirms Google accepts the generated URL and renders the translated page. If Google changes or blocks this URL format, record the limitation and do not claim runtime acceptance.

## Operational note

Google's direct website-translation URL is an external service behavior, not a stable application API. Keep the URL construction isolated in the shared selector component so it can be changed or removed without altering the site's content model or hosting architecture.
