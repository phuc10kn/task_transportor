---
schema: entity-instance/v1
id: MOD-010
slug: dashboard
title: Dashboard
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
summary: Module read-model nhẹ phục vụ reporting và vận hành. Nó tổng hợp dữ liệu từ nhiều owner nhưng không ghi vào business state của họ.
theory_basis:
  - TH-MOD-02
  - TH-MOD-06
---
# MOD-010 - Dashboard

## Summary

Module read-model nhẹ phục vụ reporting và vận hành. Nó tổng hợp dữ liệu từ nhiều owner nhưng không ghi vào business state của họ.

## Meaning

Module read-model nhẹ phục vụ reporting và vận hành. Nó tổng hợp dữ liệu từ nhiều owner nhưng không ghi vào business state của họ.

## Responsibility

- Dashboard summary.
- Dashboard alerts.
- Đọc dữ liệu vận hành từ nhiều nguồn để trả về một view tập trung cho admin.

## Key properties

| Property | Value |
|----------|-------|
| Public surface | `src/modules/Dashboard/DashboardApi.js`, `src/modules/Dashboard/http/routes.js` |
| Owned behavior | reporting aggregation, operations alert view |
| Read scope | issues, projects, sync jobs, translation queue, anomaly log |
| Write ownership | none đối với business state chính |

## Rules / constraints

- Dashboard chỉ là consumer read.
- Không được cài business orchestration mới trong dashboard controllers.
- Nếu cần write, phải đi qua owner module tương ứng.

## Related Entities

- Canonical relation: [MB-003-read-allowlist](../../../02-boundaries/module-boundaries/MB-003-read-allowlist/README.md) - boundary cho phép read đa nguồn
- Context/evidence: [MOD-001-cis](../../modules/MOD-001-cis/README.md) - nguồn issue state
- Context/evidence: [MOD-006-sync](../../modules/MOD-006-sync/README.md) - nguồn job/journal state
- Context/evidence: [MOD-005-anomaly](../../modules/MOD-005-anomaly/README.md) - nguồn alert state


## Relations

Chưa có outbound relation canonical trong baseline hiện tại. Prose liên quan được giữ làm context hoặc evidence; chỉ materialize theo DEC-002.

## Evidence

- `src/modules/Dashboard/DashboardApi.js`
- `src/modules/Dashboard/http/routes.js`
- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
