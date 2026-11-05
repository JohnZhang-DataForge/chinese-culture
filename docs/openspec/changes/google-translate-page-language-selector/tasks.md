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

 
## P3 — Language switching regression

- [x] P3.1 Reproduce the second-selection failure from the supplied browser recording.
- [x] P3.2 Decode an existing Google Translate proxy hostname back to the original website hostname.
- [x] P3.3 Recover a nested proxy hostname produced by the previous implementation.
- [x] P3.4 Preserve the current path, normal query parameters and fragment while replacing the target language.
- [x] P3.5 Add automated tests for normal language switching and legacy nested-proxy recovery.
- [ ] P3.6 Run CI and deploy the correction.
- [ ] P3.7 Re-test switching between multiple languages in a real browser.


## P4 — Remove Google Translate form warning trigger

- [x] P4.1 Identify the site's only native form control: the language selector `<select>`.
- [x] P4.2 Replace the native select with a keyboard-accessible `details/summary` menu and language links.
- [x] P4.3 Keep language switching aware of the current Google Translate proxy URL.
- [x] P4.4 Add static checks that fail if any public page contains native form controls.
- [ ] P4.5 Run CI and verify every built page is form-control-free.
- [ ] P4.6 Re-test the translated page in a real browser and confirm the Google security interstitial is gone.
