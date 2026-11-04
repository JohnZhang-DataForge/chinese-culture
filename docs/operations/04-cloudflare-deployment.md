# Cloudflare Pages Deployment — Current State

**Updated:** 2026-11-05  
**Project:** \`chinese-culture\`  
**Pages hostname:** [https://chinese-culture-79h.pages.dev](https://chinese-culture-79h.pages.dev)  
**Canonical custom domain:** [https://chinese-culture.site](https://chinese-culture.site)

## Verified deployment

The latest Cloudflare Pages project read returned a successful production deployment:

- Deployment ID: \`ce2e7daa-86af-4f55-baed-80730b63e7c7\`.
- Source branch: \`main\`.
- Source commit: \`539b37c9bfa5363f7149c95563bd549957eeff3d\`.
- Pages deployment stage: \`success\`.
- Pages Functions: disabled.
- Project mode: Direct Upload.

GitHub Actions evidence:

- [Pages deployment run #41932129872](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129872) — success.
- [Static CI run #41932129795](https://github.com/JohnZhang-DataForge/chinese-culture/actions/runs/41932129795) — success.

## Current domain state

- Zone \`chinese-culture.site\`: active.
- Apex Pages custom domain: active; verification and HTTP validation active.
- WWW Pages custom domain: pending; verification active; HTTP validation pending.
- Both DNS CNAME records point to \`chinese-culture-79h.pages.dev\` and are proxied.
- An enabled 301 rule redirects \`www\` to the apex and preserves path/query.

If \`www\` remains pending, investigate the HTTP validation path. Cloudflare documents that redirect rules can interfere with Pages HTTP validation. Do not remove the redirect or change DNS without coordinating with the infrastructure owner.

## Deployment workflow

The repository uses GitHub Actions + Wrangler Direct Upload. A push to \`main\` triggers deployment. Pull requests run CI only. The deployment workflow checks \`CLOUDFLARE_API_TOKEN\`, then uploads \`dist/\` to the existing Pages project. The account ID is configured in workflow YAML and is not a secret.

## Release verification

A successful Pages deployment record confirms that Cloudflare accepted the upload. A full release check should separately verify:

- Home page and representative nested routes.
- CSS, favicon, robots file and response headers.
- Designed 404 behavior.
- Apex HTTPS.
- WWW redirect after custom-domain validation.
- Mobile navigation and keyboard access.
- The deployed commit SHA.

## Rollback

Use Cloudflare Pages deployment history to roll back to a known-good production deployment. If there is no prior deployment to select, use a reviewed Git revert and let the main-branch deployment workflow publish the corrected source. See [rollback procedure](rollback-procedure.md).

## Official references

- [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages debugging](https://developers.cloudflare.com/pages/configuration/debugging-pages/)
- [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
