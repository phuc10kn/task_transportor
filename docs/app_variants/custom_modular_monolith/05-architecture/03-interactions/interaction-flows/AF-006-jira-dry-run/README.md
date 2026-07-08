---
id: AF-006
slug: jira-dry-run
entity_type: InteractionFlow
layer: 05-architecture
concern: 03-interactions
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# AF-006 - Jira Dry Run

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

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md`
