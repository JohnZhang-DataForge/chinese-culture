# Developer Runbook

**Status:** Current Astro and Cloudflare Pages runbook.

Use the newer guides as canonical references:

- [Development Guide](development-guide.md) — local setup, source map and commands.
- [Deployment Guide](deployment-guide.md) — CI, Pages Direct Upload and release verification.
- [Testing Guide](testing-guide.md) — static verifier coverage and manual checks.
- [Content Management Guide](content-management-guide.md) — adding and editing Markdown content.

## Quick start

~~~bash
npm install
npm run dev
npm run build
npm run verify
~~~

The package requires Node.js >=20.19; GitHub Actions currently uses Node.js 22. The repository has no committed npm lockfile, so current CI uses \`npm install\`.

## Current production state

Cloudflare Pages project \`chinese-culture\` has a successful production deployment. Latest verified deployment ID: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`, source SHA \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.

The apex custom domain is active; the \`www\` hostname is still pending validation.

## Credential reminder

Production deployment requires GitHub Actions secret \`CLOUDFLARE_API_TOKEN\`. Do not store token values in the repository or documentation. The account ID is configured in the workflow and is not a secret.

See [GitHub token setup](../operations/github-token-setup.md).
