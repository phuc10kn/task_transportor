---
id: MOD-004
slug: mapping
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# MOD-004 - Mapping

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

## Evidence

- `src/modules/Mapping/MappingApi.js`
- `src/modules/Mapping/application/findApprovedMappingRule.js`
- `src/modules/Mapping/application/getMappingSettings.js`
