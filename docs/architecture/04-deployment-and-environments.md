# Deployment, Environments and Release Process

**Status:** Proposed; no deployment exists yet.

## Proposed environments

- **Local preview:** editor/developer validates page structure and content in development.
- **Preview build:** optional temporary private review URL for each pull request.
- **Production:** public Cloudflare-hosted static site connected to the chosen domain.

## Release plan for a later phase

1. Confirm Cloudflare account permissions, domain management, GitHub permissions and any required billing limits.
2. Implement static site and establish a repeatable build process.
3. Add pre-publication checks for link resolution, page metadata, accessibility and build success.
4. Define secure GitHub-to-Cloudflare deployment authorization; never commit credentials.
5. Configure preview and production with different boundaries.
6. Publish a test release, verify routes and HTTPS, then make the official launch.
7. Record the release identifier and rollback process.

## Release gates

A release must pass site build, link checks, mobile usability, key-path accessibility, verified source links, no expired current event announcements and no unexpected personal-data collection.

## Rollback

Re-deploy the last known-good artifact or restore the prior accepted commit, depending on chosen deployment workflow. Keep a written owner and action sequence; test it before launch.

## Operational decisions

Determine who can deploy, who approves content changes, how domain renewals are tracked, and how to handle a compromised account or a publishing mistake.

## Not in this phase

No GitHub Actions YAML, Cloudflare configuration, Terraform or deployment scripts are added by this documentation-only change.
