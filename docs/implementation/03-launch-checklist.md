# Launch Readiness Checklist

**Status:** Proposed. Complete this before public launch.

## Product and editorial

- [ ] Mission, audience and MVP approved.
- [ ] All required section indexes and page types present.
- [ ] Starter curriculum, evergreen articles, book guides and event examples reviewed.
- [ ] Historical claims and cultural descriptions checked against sources.
- [ ] Chinese characters, Pinyin and translations checked.
- [ ] All images and quotations used with appropriate permissions and attribution.
- [ ] Outdated announcements marked clearly; real events verified.

## User experience

- [ ] Navigation works on common phone and desktop widths.
- [ ] Site can be used without a mouse.
- [ ] Appropriate contrast, alt text, focus state and heading order.
- [ ] Lesson next/previous links and article related links work.
- [ ] Language links only lead to actually reviewed pages.
- [ ] Error and not-found pages help people recover.

## Technical readiness

- [ ] Production build succeeds; deploy and rollback procedures tested.
- [ ] HTTPS, domain redirects, canonical URLs and metadata validated.
- [ ] Sitemap and search indexing policy verified.
- [ ] No exposed secrets, unpublished drafts or internal assets.
- [ ] Cloudflare Workers Free account, static assets hosting, domain ownership and recurring charges documented.
- [ ] No always-on Node.js server, accidental SSR or mandatory Worker execution on normal article pages.
- [ ] Static assets stay within current per-version file count and per-file size limits.
- [ ] If any Worker script runs, Free CPU/request, request/day, memory and subrequest limits are tested and monitored.
- [ ] Normal static page requests confirmed to be free asset delivery, not script invocations.
- [ ] Privacy and cookie behavior match published policies.
- [ ] Broken links, performance and key accessibility checks passed.

## Go/no-go

- [ ] Product owner approves.
- [ ] Editorial/factual reviewer approves.
- [ ] Technical/operations owner approves.
- [ ] Known limitations documented and not misleading to visitors.

Record sign-off date, release identifier, owner and any accepted non-blocking issues when implementation occurs.
