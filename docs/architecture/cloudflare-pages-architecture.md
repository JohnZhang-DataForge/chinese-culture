# Cloudflare Pages Architecture

**Status:** Implemented — static Pages Direct Upload.  
**Last verified:** 2026-11-05.

## Build and delivery model

~~~mermaid
flowchart LR
  A[GitHub main] --> B[GitHub Actions]
  B --> C[Node.js 22 and npm install]
  C --> D[npm run build]
  D --> E[npm run verify]
  E --> F[dist/]
  F --> G[cloudflare/wrangler-action]
  G --> H[Cloudflare Pages project]
  H --> I[Static asset delivery]
~~~

Node.js is used on a developer machine or GitHub-hosted runner during the build. It is not a permanent production server. Cloudflare Pages serves prebuilt static assets.

## Repository configuration

| File | Verified behavior |
|---|---|
| \`astro.config.mjs\` | \`output: "static"\`, \`trailingSlash: "always"\`; no Cloudflare SSR adapter |
| \`wrangler.jsonc\` | Pages project name \`chinese-culture\`, output directory \`./dist\`, compatibility date \`2026-11-04\` |
| \`package.json\` | Astro \`^5.16.0\`, Wrangler \`^4.34.0\`; scripts \`dev\`, \`build\`, \`preview\`, \`verify\`, \`deploy\` |
| \`.github/workflows/site-ci.yml\` | Pull requests and pushes to \`main\`: Node 22, \`npm install\`, build and verify |
| \`.github/workflows/pages-deploy.yml\` | Push to \`main\` and manual dispatch: build, verify, then Wrangler Direct Upload |

The repository currently has no committed npm lockfile. CI uses \`npm install\`, not \`npm ci\`.

## Deployment behavior

The deployment workflow:

1. Checks out the selected \`main\` source.
2. Sets up Node.js 22.
3. Installs dependencies with \`npm install --no-audit --no-fund\`.
4. Runs \`npm run build\` and \`npm run verify\`.
5. Fails early if repository Actions secret \`CLOUDFLARE_API_TOKEN\` is missing.
6. Runs \`cloudflare/wrangler-action@v4\` with the token and the account ID embedded in the workflow.
7. Executes \`pages deploy dist --project-name=chinese-culture --branch=main\`.

Pull requests run CI but do not deploy to production. A push to \`main\` triggers both the CI workflow and the Pages deployment workflow.

## Cloudflare resource snapshot

- Account ID: \`dff021f8489d2c316a14575c76de16d4\` (identifier, not a credential).
- Pages project: \`chinese-culture\`.
- Pages project ID: \`7d79fba6-5fed-4f22-bce1-7e46dc5bfd06\`.
- Pages hostname: \`chinese-culture-79h.pages.dev\`.
- Latest verified production deployment ID: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Deployed commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Pages reports \`uses_functions=false\`.

## Static verification

\`npm run verify\` runs \`scripts/verify-static.mjs\`. It checks required generated routes, absence of \`dist/_worker.js\`, the Wrangler output directory and project name, the absence of a Worker entrypoint, Pages file-count and file-size limits, homepage branding, local links and a minimum number of educational content pages.

The verifier is a static-output guardrail. It is not a browser E2E test, an accessibility audit, a security penetration test or proof that custom domains have finished certificate validation.

## Deliberate exclusions

No Pages Functions, SSR adapter, Worker entrypoint, database, D1, KV, R2, queue, persistent Node process or runtime API is part of the current public-site implementation. Adding one changes the security, cost and operational model and requires an approved design update.

## Operations

See [deployment guide](../implementation/deployment-guide.md), [Cloudflare configuration](../operations/cloudflare-configuration.md) and [rollback procedure](../operations/rollback-procedure.md).
