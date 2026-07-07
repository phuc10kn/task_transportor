---
id: CCR-004
slug: dry-run-before-jira-write
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-03
---

# CCR-004 - Dry Run Before Jira Write

## Meaning

Outbound sang Jira cần preview/readiness trước khi ghi thật.

## Statement

Dry-run không chỉ là tiện ích UI; nó là guardrail kiến trúc cho payload build, mapping completeness và anomaly checks.

## Scope

`Jira`, `Mapping`, `Anomaly`, `Cis`, `Sync`

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`
