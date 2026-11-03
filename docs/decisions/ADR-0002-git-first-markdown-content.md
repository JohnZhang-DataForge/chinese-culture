# ADR-0002: Git-first Markdown Content

**Status:** Accepted for initial MVP implementation

## Context

Educational material requires evidence, corrections, review history and controlled publication. The MVP team is expected to be small, and content volume is manageable.

## Decision

Store article and lesson source as Markdown alongside reviewed project documentation. Use branches, pull requests and tagged content metadata to approve changes.

## Consequences

This enables traceable history and editorial review without a paid CMS. It requires contributor guidance and is less friendly for some nontechnical writers.

## Alternatives

Hosted headless CMS, wiki tools or a database-backed editor. Revisit when sustained editorial workload proves Git-first publishing too costly or inaccessible.

## Governance

Changes to editorial templates and taxonomy are reviewed together with content. Maintain clear ownership of corrections, translations and image rights.
