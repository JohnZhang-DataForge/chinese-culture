# Maintenance, Reliability and Learning Loop

**Status:** Proposed

## Weekly

Check upcoming event accuracy, broken outbound links, new feedback, publishing requests and failed deploys once technical workflows exist.

## Cloudflare Free service monitoring

Track Static Assets file count and individual asset sizes, deploy/build errors, hostname and HTTPS, and (if ever enabled) Worker script request count, CPU time and 1027/429 quota errors. Ordinary static asset delivery is free and unlimited under current pricing, whereas dynamic Worker usage is capped. No persistent Node.js service should need uptime monitoring. Recheck official [pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [limits](https://developers.cloudflare.com/workers/platform/limits/) before adding features or changing rollout.

## Monthly

Review popular educational entry points, pages with unanswered reader questions, correction requests, content freshness, hosting consumption and domain/billing status.

## Quarterly

Review major topic gaps, accessibility regressions, expired links, cultural terminology changes, translated pages and whether optional functionality is justified.

## Event lifecycle

Verify newly listed events; re-check near their dates; mark canceled or completed promptly; keep evergreen festival content separate from event status.

## Incident response

When a bad release occurs, stop publication, assess whether public information or credentials are affected, restore last-known-good release, correct source content and record lessons learned.

## Measurement policy

Prefer aggregate and privacy-conscious data. Avoid collecting unnecessary personal identifiers, IP-level profiles or persistent cross-site tracking.

## Operating scorecard

Report: reviewed lessons published, corrections resolved, stale announcements, broken links, accessibility defects, uptime/issues, monthly costs and reader feedback themes.

## Ownership

Assign named maintainers for domain renewal, publishing approvals, Cloudflare access, GitHub access and content corrections before public launch.
