# Design: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector  
**Status:** Proposed

## 1. Architecture

The public site remains a static Astro build:

\`\`\`text
Reader
  |
  v
Astro static page on Cloudflare Pages
  |
  v
Select Language control (native HTML select)
  |
  | user chooses target language
  v
Browser builds a URL using URL + URLSearchParams
  |
  v
Google Translate website-translation endpoint
  |
  v
Google-hosted translated view of the current page
\`\`\`

No translation request is sent to a project-owned API. The static site does not need an always-on service, Pages Function, API key, database or paid Cloudflare resource.

## 2. Component placement

- Add \`src/components/GoogleTranslate.astro\`.
- Import it once from \`src/layouts/BaseLayout.astro\`.
- Place it in the shared header so it is available on all public routes.
- Use scoped component styles and the existing site's neutral palette.
- On narrow screens, allow the header tools to wrap so the selector does not compress the brand or mobile navigation.

## 3. Interaction

The component renders a native select:
- Empty initial option: \`Select Language\`.
- Each supported option has a human-readable language label and Google Translate target-language code.
- On change, construct \`https://translate.google.com/translate\` with:
  - \`sl=auto\` — let Google detect the page's source language.
  - \`tl=<selected language>\` — target language.
  - \`u=<window.location.href>\` — current page URL.

Use \`URL\` and \`URLSearchParams\`; do not concatenate an unescaped query string. Navigate in the same tab to the translated view so browser Back returns to the original page.

The attribution is a plain link to Google Translate and reads **Powered by Google Translate**. This is a custom selector that launches Google's website translation service; it is not the retired embedded Website Translator widget.

## 4. Language choices

Offer a practical set of common target languages (including Spanish, French, German, Japanese, Korean, Arabic, Hindi, Portuguese, Russian, Thai and Vietnamese). Keep language codes in the component markup and avoid fetching a runtime language catalogue.

## 5. Privacy

The selector itself makes no network request to Google while the page is merely viewed. After a visitor chooses a language, the browser navigates to Google Translate with the current page URL. Google may retrieve and process that public page to render its translation. The privacy page must state this and link to Google's privacy policy.

Do not claim that the project hosts, stores, reviews or guarantees Google's machine translations.

## 6. Security and resilience

- Only construct a fixed Google Translate endpoint.
- Use the current browser URL as the page parameter; do not accept arbitrary user-entered URLs.
- Keep the control usable by keyboard and screen readers.
- Leave the original site fully functional when JavaScript is disabled.
- Do not hide or rewrite the site's canonical URLs, language metadata or native locale navigation.
- Do not use CSS to conceal Google branding or translation notices inside Google's translated view.

## 7. Validation

- Run \`npm run build\`.
- Run \`npm run verify\`.
- Extend static verification to assert the selector and attribution exist and the legacy embed script is absent.
- Inspect generated pages for the control.
- Perform a manual browser test for at least Spanish and Japanese on desktop and mobile. Record the actual result because Google may change external URL behavior independently of this repository.
