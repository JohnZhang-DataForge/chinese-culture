# Development Change Log

Record verified changes and operational outcomes. A source commit, passing CI, successful Pages upload and full production acceptance are distinct milestones.

## 2026-11-11 — Multilingual content review and privacy clarification

- PR #58 corrected the Simplified Chinese Qu Yuan paragraph to match its English source and standardized the Nian term as 年兽.
- PR #59 clarified that public browsing and Cloudflare Access authentication for the protected Admin area have different cookie behavior; English, Simplified Chinese, Spanish and legacy privacy copy were aligned.
- PR #60 refreshed the content inventory for 13 concepts and 39 locale variants, updated P3.5 review evidence and recorded external reference-link checks.
- Main CI #42925233625 and Pages deployment #42925233585 passed for Main `a30d0872380d4da97054646138dbab703999bde6`.
- Production deployment `a087d8b6-ecbe-4a36-93dc-275f4b62515d` serves that Main commit.
- Historical content WIP PR #2 was closed after its useful inventory was refreshed in PR #60 and its older style guide was superseded by the approved guide in PR #56.

## 2026-11-11 — Documentation reconciliation in progress

The README and core architecture/operations documents are being aligned with the deployed multilingual site, Pages Functions, D1 canonical editorial store and current GitHub App/main-ruleset blockers. Older documentation must not describe the site as English-only, undeployed or database-free.

## Historical changes

See the merged PR history and earlier entries below for initial Astro implementation, D1 provisioning/import, Admin UI/API, preview testing, backup/restore and deployment hardening.
