# Backup and Recovery

## Current data model

The private GitHub repository is the editable source of truth for:

- Astro application source.
- Markdown teaching content.
- Static public assets.
- Build and deployment workflows.
- Technical documentation.

The deployed \`dist/\` directory is generated output. The current website has no CMS database, event database, user-account store, media object store or runtime file upload area.

## What is protected by Git history

Git records committed source and content changes. Pull requests provide review context. Deleted or overwritten Markdown can usually be recovered from a previous commit as long as repository history remains available.

Git history is not an independent backup. Repository deletion, account compromise or destructive administrative actions can affect the primary copy.

## Recommended independent repository backup

An authorized maintainer can keep an encrypted mirror in an approved private backup location:

~~~bash
git clone --mirror https://github.com/JohnZhang-DataForge/chinese-culture.git
cd chinese-culture.git
git remote update --prune
~~~

Store the mirror outside the same GitHub organization/account security boundary. Protect access with MFA and least privilege. Do not place a credential in the command text or save it in shell history.

## Recover a file

1. Find the last-known-good commit in GitHub history.
2. Restore the file from that commit on a new branch.
3. Open a pull request.
4. Run CI and review the restored content.
5. Merge and confirm the Pages deployment.

For a full source rollback, use the reviewed Git revert process in [rollback procedure](rollback-procedure.md).

## Static assets

Current public assets are stored in Git under \`public/\`. There is no external media upload store to back up. If an approved media store is introduced later, document object versioning, deletion protection, retention, export and recovery before enabling uploads.

## Cloudflare configuration backup

The Cloudflare configuration is external to the Git repository. Before changing DNS, Pages domains or redirect rules, record the current state in:

- [Cloudflare configuration](cloudflare-configuration.md)
- [Domain DNS change log](domain-dns-change-log.md)

For a significant change, capture an authorized configuration export or dashboard evidence in the approved private operations location. Do not store API tokens or private keys with the export.

## Recovery priorities

1. Restore private repository access.
2. Recover the source branch/commit.
3. Verify dependencies and run build/static checks.
4. Restore Cloudflare Pages deployment using the protected deployment workflow.
5. Restore or verify DNS and custom-domain settings.
6. Test the public site and record the recovery SHA and deployment ID.

## Backup gaps

No scheduled independent Git mirror, automated DNS export or external media backup job is verified in the current implementation. Do not claim those backups exist until they are configured and tested.
