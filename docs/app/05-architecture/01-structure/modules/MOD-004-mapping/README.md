---
schema: entity-instance/v1
id: MOD-004
slug: mapping
title: Mapping
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Sở hữu mapping rule approved dùng cho outbound value translation.
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
relations:
  owns:
    - SO-005
---

# MOD-004 - Mapping

## Summary

Sở hữu mapping rule đã review hoặc approved cho outbound value translation.

## Meaning

Module giữ mapping rules đã review hoặc approved để outbound sync và dry-run có thể dịch giá trị giữa các hệ thống.

## Responsibility

- CRUD mapping rules.
- Approve hoặc reject rule.
- Expose lookup cho approved mapping rule.
- Cung cấp mapping settings phục vụ validation và dry-run.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Mapping/MappingApi.js`, `src/modules/Mapping/http/routes.js` |
| Owned state | `mapping_rules`, mapping settings |
| Main consumers | `Jira`, `Projects`, admin UI |
| Main risk | mapping gap có thể chặn sync |

## Rules / constraints

- Mapping ownership không nằm trong `Jira` dù được dùng mạnh ở outbound.
- Rule chưa approve không được coi là canonical mapping.
- Missing mapping có thể tạo anomaly thay vì bypass âm thầm.

## Related Entities

- [MOD-005-anomaly](../../modules/MOD-005-anomaly/README.md) - phản ánh mapping gap
- [MOD-007-jira](../../modules/MOD-007-jira/README.md) - consumer chính của approved mapping
- [SO-005-mapping-approval-state](../../../04-state/state-owners/SO-005-mapping-approval-state/README.md) - state owner tương ứng

## Relations

- `owns`: [SO-005-mapping-approval-state](../../../04-state/state-owners/SO-005-mapping-approval-state/README.md).
- Consumer và dependency trong Related Entities giữ ở prose vì Module chưa có slot relation canonical tới Module khác.

## Evidence

- `src/modules/Mapping/MappingApi.js`
- `src/modules/Mapping/application/findApprovedMappingRule.js`
- `src/modules/Mapping/application/getMappingSettings.js`

## Validation Notes

- Ownership của Mapping đối với mapping approval state được nêu trực tiếp trong rule và state owner evidence.
