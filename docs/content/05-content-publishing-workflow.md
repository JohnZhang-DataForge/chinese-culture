# Content Publishing Workflow

**Status:** Proposed

## Workflow

**Idea → Brief → Research → Draft → Editorial/factual review → Rights/accessibility review → Approval → Publish → Monitor → Refresh.**

## Responsibilities

- **Product owner:** priorities, feature scope and final publication policy.
- **Writer/editor:** draft clarity, references, metadata, internal links and corrections.
- **Cultural/factual reviewer:** accuracy, nuance, regional variation and source quality.
- **Technical reviewer:** Markdown link validity, navigation, build compatibility and accessibility.
- **Publisher:** authorized merge and production release when implementation exists.

One person may hold multiple roles, but high-risk claims merit a second reviewer.

## GitHub process

Start from an approved brief; work in a branch; submit a pull request describing topic, reader, sources, images, editorial questions and changed links. Address comments before merging. Significant scope/architecture changes require a linked ADR.

## Publication categories

Draft, in-review, approved, published, needs-update and archived. A draft should not appear on the public website.

## Mandatory checks

Facts and context; non-plagiarized prose; citations; copyright and image attribution; Chinese character/romanization consistency; accessibility; metadata; related links; reviewer and review date.

## Corrections

Correct dangerous or materially inaccurate information promptly. Retain Git history and consider a public note for major corrections. Archive time-sensitive announcements without breaking inbound links.

## Review cadence

Check events weekly, evergreen articles quarterly or when evidence changes, and editorial guidelines at least twice per year.
