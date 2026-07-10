---
schema: entity-instance/v1
id: MB-002
slug: public-api-only
title: Public API Only
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Boundary này chốt cross-module dependency phải đi qua public entry point của owner module.
theory_basis:
  - TH-MOD-02
  - TH-MOD-04
relations:
  constrains:
    - MOD-001
    - MOD-002
    - MOD-003
    - MOD-004
    - MOD-005
    - MOD-006
    - MOD-007
    - MOD-008
    - MOD-009
    - MOD-010
---
# MB-002 - Public API Only

## Summary

Boundary này chốt cross-module dependency phải đi qua public entry point của owner module.

## Meaning

Boundary này chốt cross-module dependency phải đi qua public entry point của owner module.

## Statement

Module khác không import sâu vào `application/`, `infrastructure/` hoặc `support/` của owner khác. Điểm vào chuẩn là `<Domain>Api.js`.

## Protected assets

- thông tin ẩn bên trong module
- quyền refactor nội bộ mà không phá consumer
- ownership discipline của custom modular monolith

## Allowed / forbidden

- Được phép: gọi `AuthApi`, `CisApi`, `SyncApi`, `JiraApi`...
- Bị cấm: phụ thuộc trực tiếp vào implementation detail của module khác.

## Related Entities

- Canonical relation: [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - public API cho worker orchestration
- Canonical relation: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - public API cho outbound integration



## Why this boundary matters

Boundary này chốt cross-module dependency phải đi qua public entry point của owner module. Boundary này giữ owner, access hoặc write discipline không bị mơ hồ khi code thay đổi.

## Architectural consequences

Module chịu boundary này phải giữ public API, owner-write discipline và các read/write exception đã được nêu trong Statement.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `docs/app/05-architecture/01-structure/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
