# Backup and Recovery

## Current source of truth

The private GitHub repository is the editable source of truth for Astro application source, Markdown content, static assets, workflows and documentation.

The deployed `dist/` directory is generated output. The current main branch has no CMS database, event database, user-account store, external media object store or runtime upload area.

## What Git protects

Git history records committed source/content changes. Pull requests preserve review context. Deleted or overwritten Markdown can usually be restored from an earlier commit as long as repository history remains available.

Git history is not an independent backup. Repository deletion, account compromise or destructive administrative actions can affect the primary copy.

## Recommended independent repository backup

An authorized maintainer can keep an encrypted mirror in an approved private backup location:

~~~bash
git clone --mirror https://github.com/JohnZhang-DataForge/chinese-culture.git
cd chinese-culture.git
git remote update --prune
~~~

Store the mirror outside the same GitHub organization/account security boundary. Protect access with MFA and least privilege. Do not place credentials in command text or shell history.

## Recover a file

1. Find the last-known-good commit in GitHub history.
2. Restore the file from that commit on a new branch.
3. Open a pull request.
4. Run CI and review the restored content.
5. Merge and confirm the Pages deployment.

For a full source rollback, use the reviewed Git revert process in [Rollback Procedure](rollback-procedure.md).

## Proposed CMS drafts and media

Agent 0's Proposed design stores drafts on `cms/<contentId>/<locale>` branches and Git-backed media under `public/media/<contentId>/`. Published/unpublished content remains in Git history. These branches and paths are not yet implemented in current main.

If the CMS is delivered, include draft branches and media commits in the independent Git mirror and test restoration of both Markdown and image metadata.

## Cloudflare configuration backup

Cloudflare DNS, Pages custom-domain associations, redirect rules and SSL settings are external to the Git repository. Before changing them, record the current state in:

- [Cloudflare configuration](cloudflare-configuration.md)
- [Domain DNS change log](domain-dns-change-log.md)

For significant changes, capture an authorized configuration export or dashboard evidence in the approved private operations location. Never store API tokens or private keys with the export.

## Recovery priorities

1. Restore private repository access.
2. Recover the source branch/commit.
3. Verify dependencies and run build/static checks.
4. Restore Pages deployment through the protected workflow.
5. Verify DNS, Pages domains, certificate and redirects.
6. If the Admin Worker is deployed, recover/rollback it independently.
7. Test the public site and record recovery SHA/deployment IDs.

## Backup gaps

No scheduled independent Git mirror, automated DNS export or external media backup job is verified in current implementation. Do not claim these backups exist until configured and tested.
