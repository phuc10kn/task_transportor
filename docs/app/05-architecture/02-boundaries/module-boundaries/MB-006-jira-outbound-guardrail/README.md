---
id: MB-006
slug: jira-outbound-guardrail
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-SYNC-SAFE-01
  - TH-SYNC-SAFE-03
---

# MB-006 - Jira Outbound Guardrail

## Meaning

Boundary này chốt outbound sang Jira phải là đường có kiểm soát, không phải write path trực tiếp và tùy tiện.

## Statement

Trước khi ghi Jira thật, hệ thống phải có dry-run/readiness, mapping/anomaly checks và journal cho execution path.

## Protected assets

- tính đúng đắn của payload outbound
- audit trail của sync
- boundary `CIS -> Jira` thay vì `System -> Jira`

## Allowed / forbidden

- Được phép: build preview, kiểm mapping, enqueue push job, save sync result.
- Bị cấm: sync trực tiếp từ raw Backlog payload hoặc bỏ qua readiness gate.

## Related Entities

- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - module thực thi outbound
- [AF-006-jira-dry-run](../../../03-interactions/interaction-flows/AF-006-jira-dry-run/README.md) - flow preview
- [AF-007-cis-to-jira-sync](../../../03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md) - flow sync thật

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `src/modules/Jira/application/requestJiraSync.js`
