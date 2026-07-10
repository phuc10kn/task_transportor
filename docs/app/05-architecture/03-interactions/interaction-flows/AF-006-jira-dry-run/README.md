---
schema: entity-instance/v1
id: AF-006
slug: jira-dry-run
title: Jira Dry Run
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
summary: Preview payload outbound và readiness trước khi ghi Jira thật.
theory_basis:
  - TH-SYNC-SAFE-02
  - TH-SYNC-SAFE-03
  - TH-CANON-01
relations:
  involves:
    - MOD-007
    - MOD-004
    - MOD-005
---

# AF-006 - Jira Dry Run

## Summary

Preview outbound payload và readiness trước khi ghi Jira thật.

## Meaning

Luồng preview outbound payload sang Jira mà chưa ghi thật.

## Trigger

Admin gọi route dry-run theo issue.

## Path

`Admin -> Jira HTTP -> JiraApi.runJiraDryRun(...) -> read canonical snapshot -> MappingApi -> AnomalyApi -> build payload preview`

## Outcome

User nhận preview payload và readiness signal trước khi sync thật.

## Related Entities

- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md)
- [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md)
- [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md)

## Relations

- `involves`: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md), [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md), [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md).
- Không ghi inverse `participates_in`; reverse trace được suy ra từ relation `involves` của flow này.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`

## Validation Notes

- Cả ba module là participant được nêu trực tiếp trong path và related entities của flow.
