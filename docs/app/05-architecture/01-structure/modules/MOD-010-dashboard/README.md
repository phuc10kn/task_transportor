---
id: MOD-010
slug: dashboard
entity_type: Module
layer: 05-architecture
concern: 01-structure
status: active
theory_basis:
  - TH-MOD-02
  - TH-MOD-06
---

# MOD-010 - Dashboard

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

- [MB-003-read-allowlist](../../../02-boundaries/module-boundaries/MB-003-read-allowlist/README.md) - boundary cho phép read đa nguồn
- [MOD-001-cis](../../modules/MOD-001-cis/README.md) - nguồn issue state
- [MOD-006-sync](../../modules/MOD-006-sync/README.md) - nguồn job/journal state
- [MOD-005-anomaly](../../modules/MOD-005-anomaly/README.md) - nguồn alert state

## Evidence

- `src/modules/Dashboard/DashboardApi.js`
- `src/modules/Dashboard/http/routes.js`
- `docs/app/05-architecture/02-boundaries/README.md`
