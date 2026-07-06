---
id: MB-002
slug: public-api-only
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-MOD-02
  - TH-MOD-04
---

# MB-002 - Public API Only

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

- [MOD-006-sync](../../../01-structure/modules/MOD-006-sync/README.md) - public API cho worker orchestration
- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - public API cho outbound integration

## Evidence

- `docs/architecture/02-module-structure.md`
- `docs/architecture/04-boundaries.md`
