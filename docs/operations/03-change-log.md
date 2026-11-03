# Development Change Log

Document verified changes, decisions and release status. Do not confuse code creation with deployment.

## 2026-11-04 — Initial Astro static website MVP (feature branch)

**Reason:** Begin implementing the planned educational website while preserving a free Cloudflare Workers static hosting architecture.

### Source added

- Astro static-only project and `wrangler.jsonc` pointing to `./dist`.
- Original illustrated-by-CSS homepage, reusable layout, accessible mobile navigation and story cards.
- Generated index/detail routes for four Markdown content collections.
- Five beginner lessons, three culture articles, three festival explainers and two book guides.
- Events empty-state page; About, Contact (channel pending), Editorial, Privacy, Accessibility and 404 pages.
- GitHub Actions build-only CI, Node static verifier, favicon, headers and robots policy.

### Documentation added or updated

Developer runbook, implementation status, repository map, content schema/routes, test strategy, this change log and root documentation index. Architecture ADRs reflect the selected implementation baseline.

### Constraints preserved

No paid service, database, always-on Node.js process, Cloudflare SSR adapter, Worker API, secrets, personal data collection, external media embed or unverified event listings.

### Verification

At initial commit, source is in a feature branch; build and CI outcomes must be recorded separately. **No public Cloudflare deployment verified.**

### Follow-up

Run CI, fix any build problems, review PR, merge, complete cultural/a11y review, assign contact channel and perform an authorized Cloudflare Free preview/release.

### CI verification, first pass

[GitHub Actions run #41717562416](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41717562416) passed on 2026-11-03 20:59 UTC: npm install, Astro static build (25 pages), and static verifier (12 expected routes, 29 files, no Worker SSR) succeeded. A follow-up patch upgrades GitHub Actions checkout/setup-node to v7 and adds internal-link checks. Merge requires that follow-up run to pass as well.

### CI validation hardening — final pass

An intermediate CI run [#41717877814](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41717877814) exposed a malformed JavaScript regular expression in the new internal-link checker. The checker was rewritten and required a minimum count to prevent silent no-op tests. [Run #41718018724](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41718018724) then passed: **25 static pages, 13 educational guides, 29 assets, 700 local links, zero SSR worker**. This confirms build-time source integrity, **not** browser accessibility or a Cloudflare deployment.
