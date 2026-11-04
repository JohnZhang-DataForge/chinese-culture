# Bilingual Routing

**Current status:** Not implemented in the inspected \`main\` source.  
**Contract status:** Agent 0's approved localization/OpenSpec contract was not present on \`main\` at the time of this documentation snapshot.

## Current behavior

The site currently has one English route tree:

- \`/\`
- \`/learn/\` and \`/learn/<slug>/\`
- \`/culture/\` and \`/culture/<slug>/\`
- \`/festivals/\` and \`/festivals/<slug>/\`
- \`/books/\` and \`/books/<slug>/\`
- \`/events/\` and the English information pages

\`src/layouts/BaseLayout.astro\` emits \`<html lang="en">\`. Navigation links are hard-coded English paths. There is no locale switcher, locale preference storage, \`/en/\` or \`/zh/\` route tree, language-aware route resolver, canonical link or \`hreflang\` output in the inspected layout.

## Required design contract before implementation

The final routing rules must come from Agent 0's approved contract. This document intentionally does not establish a competing route contract. The contract must settle:

- Whether \`/en/\` and \`/zh/\` are the canonical localized prefixes.
- What the root path \`/\` does for first-time and returning visitors.
- How existing unprefixed English URLs are preserved or redirected.
- How a language switch maps to the equivalent content page.
- What happens when a translation is missing.
- Whether and how language preference is remembered.
- Canonical URLs, alternate-language links, and HTML \`lang\` values.
- Trailing-slash and 404 behavior for each locale.

The Agent 2 task brief proposes \`/en/\` and \`/zh/\`, English as the root default and preservation of existing English URLs. Treat those as implementation requirements to reconcile with Agent 0, not as behavior that exists today.

## Current compatibility rule

Do not rename or move existing content files merely to simulate localization. Existing public URLs are live on the Pages deployment. Any route migration must include explicit redirects and tests for the old URLs.

## Verification expected after implementation

The routing implementation should be documented only after source inspection and tests prove:

- Both locale home pages render with correct \`lang\`.
- Every translated content pair resolves to the intended equivalent page.
- The switcher preserves page context where a translation exists.
- Missing translations have the contract-defined fallback.
- Old URLs resolve as specified.
- Canonical and alternate-language metadata match actual routes.

See [localization guide](../implementation/localization-guide.md) and [localization content model](localization-content-model.md).
