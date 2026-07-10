---
schema: entity-instance/v1
id: MB-006
slug: jira-outbound-guardrail
title: Jira Outbound Guardrail
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Guardrail cho outbound Jira có kiểm soát.
theory_basis:
  - TH-SYNC-SAFE-01
  - TH-SYNC-SAFE-03
relations:
  constrains:
    - MOD-007
---

# MB-006 - Jira Outbound Guardrail

## Summary

Guardrail cho outbound Jira phải đi qua dry-run, readiness và journal.

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

## Relations

- `constrains`: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md), là module thực thi outbound write.
- Liên hệ với AF-006 và AF-007 giữ ở prose vì contract hiện chưa có triple `ModuleBoundary -> InteractionFlow`.

## Evidence

- `src/modules/Jira/application/runJiraDryRun.js`
- `src/modules/Jira/application/requestJiraSync.js`

## Validation Notes

- Không ghi dual `MOD-007 --governed_by--> MB-006`; relation canonical của slice này đi từ boundary tới module.
