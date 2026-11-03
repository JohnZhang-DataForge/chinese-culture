# System Architecture (Target Design, No Code)

**Status:** Proposed

## Logical architecture

**Editors and reviewers** → private GitHub Markdown repository → reviewed merge to main → deployment build → static site assets on Cloudflare → readers' browsers.

Optional future integrations (not in MVP): contact submission, search API, calendar feeds, email newsletter or event registration.

## Content path

1. An editor uses a content brief and selects an existing topic or new content ID.
2. Editor adds or revises reviewed Markdown and appropriately licensed media.
3. Reviewers check facts, language, accessibility and references via pull request.
4. Once accepted, content merges to the default branch.
5. Deployment workflow builds static pages, validates links and publishes.
6. Readers receive cached pages and media; no application database is queried.

## Boundaries

- GitHub is the authoritative content/changes source.
- Hosting serves public compiled assets only; the GitHub repository remains private.
- Secrets, if ever needed for deployment, stay in authorized secrets storage.
- Public user-submitted content must not be enabled without anti-abuse measures and moderation.

## Reliability

Static pages remain readable if GitHub is temporarily unavailable after deployment. Use cache-conscious updates, predictable URLs, redirects for changed slugs and a rollback-to-last-good-release procedure.

## Scale path

Increase content breadth and locale coverage first. Add backend systems only if specific, measurable functions require them. Keep dynamic services decoupled from the editorial content repository.

## Approval checkpoint

Review site data boundaries, owner access, publishing method, rollback, monitoring, intellectual-property risks and estimated monthly cost before implementation.
