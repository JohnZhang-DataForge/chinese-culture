# Tasks: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector

## P0 — OpenSpec

- [x] P0.1 Record the requested selector behavior and current Google widget support status.
- [x] P0.2 Define the static-first, no-API-key integration boundary.
- [x] P0.3 Define privacy, accessibility and fallback requirements.

## P1 — Implementation

- [x] P1.1 Add the reusable GoogleTranslate.astro component.
- [x] P1.2 Integrate it into the shared public layout.
- [x] P1.3 Add responsive styling without changing the existing visual identity.
- [x] P1.4 Update the public privacy notice.
- [x] P1.5 Extend static verification for selector markup and legacy-widget exclusion.

## P2 — Validation and release

- [ ] P2.1 Run Astro build and static verification.
- [ ] P2.2 Verify every generated public page includes the selector.
- [ ] P2.3 Verify no retired Google widget script is emitted.
- [x] P2.4 Test target-language URL generation for current paths, query strings and fragments.
- [ ] P2.5 Manually verify the Google-hosted translated view in a real browser.
- [ ] P2.6 Verify desktop/mobile keyboard and layout behavior.
- [ ] P2.7 Merge only after CI passes and the external-service limitation is documented.
