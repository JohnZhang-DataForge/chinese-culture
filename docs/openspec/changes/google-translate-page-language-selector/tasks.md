# Tasks: Google Translate Page Language Selector

**Change ID:** google-translate-page-language-selector

## P0 — Diagnosis

- [x] P0.1 Inspect the user's screen recording of the deployed selector.
- [x] P0.2 Confirm the previous URL opened Websites mode with an empty Website field.
- [x] P0.3 Record that Google does not prefill the Websites input from the supplied `text` parameter.

## P1 — Direct translated-site route

- [x] P1.1 Replace the Google Translate UI form URL with a direct translated-page URL builder.
- [x] P1.2 Encode literal hostname hyphens as double hyphens and dots as single hyphens.
- [x] P1.3 Preserve path, query and fragment.
- [x] P1.4 Add source-host validation and remove stale translation parameters.
- [x] P1.5 Update the privacy notice and OpenSpec design.

## P2 — Validation and release

- [ ] P2.1 Run Astro build and static verification.
- [ ] P2.2 Verify the exact production URL for Catalan.
- [ ] P2.3 Verify URL-builder edge cases.
- [ ] P2.4 Manually verify translated page loads in a real browser.
- [ ] P2.5 Merge and deploy after CI passes; confirm production behavior.
