---
schema: entity-instance/v1
id: MOD-005
slug: anomaly
title: Anomaly
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Sở hữu anomaly resolution state và blocking checks cho risky outbound path.
theory_basis:
  - TH-MOD-01
relations:
  owns:
    - SO-006
---

# MOD-005 - Anomaly

## Summary

Sở hữu anomaly resolution state và blocking checks cho risky outbound path.

## Meaning

Module ghi nhận anomaly và health finding có thể chặn sync hoặc cần review thủ công.

## Responsibility

- Tạo anomaly.
- List, ignore, resolve anomaly.
- Expose blocking anomaly checks cho flow outbound.
- Giữ audit đơn giản cho tình trạng anomaly.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Anomaly/AnomalyApi.js`, `src/modules/Anomaly/http/routes.js` |
| Owned state | `anomaly_log` |
| Main consumers | `Jira`, `Translation`, `Dashboard` |
| Main role | gatekeeper cho risky outbound paths |

## Rules / constraints

- Anomaly không sửa dữ liệu canonical thay cho owner module.
- Resolve/ignore chỉ thay trạng thái anomaly, không tự đánh dấu sync đã an toàn.
- Blocking semantics phải được consumer tôn trọng trong dry-run hoặc sync readiness.

## Related Entities

- [MOD-007-jira](../../modules/MOD-007-jira/README.md) - dùng anomaly để chặn outbound
- [MOD-010-dashboard](../../modules/MOD-010-dashboard/README.md) - đọc anomaly cho vận hành
- [SO-006-anomaly-resolution-state](../../../04-state/state-owners/SO-006-anomaly-resolution-state/README.md) - state owner tương ứng

## Relations

- `owns`: [SO-006-anomaly-resolution-state](../../../04-state/state-owners/SO-006-anomaly-resolution-state/README.md).
- Consumer trong Related Entities giữ ở prose vì Module chưa có slot relation canonical tới Module khác.

## Evidence

- `src/modules/Anomaly/AnomalyApi.js`
- `src/modules/Anomaly/application/listBlockingAnomalies.js`
- `src/modules/Anomaly/application/ensureMappingGapAnomaly.js`

## Validation Notes

- Ownership của Anomaly đối với SO-006 khớp với write policy của state owner.
