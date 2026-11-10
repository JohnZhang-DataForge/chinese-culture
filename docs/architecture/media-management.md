# Media Management

**Status:** Media upload and validation are implemented in the Admin code path, but production GitHub App setup and end-to-end acceptance remain pending.

## Current media model

The shared content contract CC-CONTENT-001 v1.2.0 distinguishes:
- Legacy/existing external cover image fields (imageUrl/imageAlt) retained for the 39 existing locale variants.
- New media metadata for uploaded assets, including a public source path, alternative text, credit and license information.

Do not create a parallel image schema. The shared contract is normative.

## Intended upload flow

1. An authenticated administrator selects an image in the protected Admin workspace.
2. The Pages Function validates the upload using file-signature checks rather than trusting the browser MIME type.
3. The workflow validates size/type constraints and required accessibility/rights metadata.
4. The asset is written to a GitHub content branch under the contract's media path.
5. A media-only PR is opened for human review.
6. D1 attaches the media metadata to the content variant only after the media PR is merged.
7. A later content publication PR can reference the approved asset.

The CMS must not write media directly to Main, auto-merge the PR or mark a media item as published before merge.

## Current production blocker

The repository-scoped GitHub App has not been installed/configured. The Pages production settings GITHUB_APP_ID, GITHUB_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY are absent. Therefore the browser upload/branch/PR sequence is not production-accepted, even though the code and local tests exist.

Until the App is configured and a real test upload is reviewed:
- Do not promise production media upload.
- Do not attach unmerged media metadata to a published article.
- Do not add unlicensed images or invent attribution.
- Do not store secrets in the asset metadata or public bundle.

## Rights and accessibility requirements

Every newly uploaded image must have:
- A meaningful alt description, or an explicitly declared decorative treatment where the contract permits it.
- Credit/creator information.
- License or permission basis.
- Source URL when needed to evidence rights.
- A supported image format and a size within the contract limit.

An ancient subject or public-domain original work does not make a modern photograph, scan, illustration or translation public domain.

## Existing covers and static assets

Existing article covers are preserved as legacy HTTPS image references with localized alt text. Do not bulk-download or re-host them without checking source rights and the migration policy. The public site continues to serve approved static assets through Cloudflare Pages.

## Validation and release

Local D1, signature-validation and browser tests are covered by repository CI. Production acceptance requires:
1. GitHub App installed only on this repository with minimum permissions.
2. Production Pages settings configured securely.
3. A real authenticated upload in the production Admin session.
4. A media-only PR created and reviewed.
5. Confirmation that D1 is unchanged before merge.
6. Merge by a human, then confirmation that D1 attaches the media metadata.
7. Public route/asset smoke test after Pages deployment.

See [CC-CONTENT-001](../openspec/contracts/content-schema.md), [GitHub App publication setup](../runbooks/github-app-publication.md), [Admin CMS architecture](admin-cms-architecture.md) and [Content Management Guide](../implementation/content-management-guide.md).
