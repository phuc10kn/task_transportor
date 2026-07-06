---
id: MB-003
slug: read-allowlist
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
theory_basis:
  - TH-MOD-05
  - TH-MOD-06
---

# MB-003 - Read Allowlist

## Meaning

Boundary này chốt các ngoại lệ đọc chéo module hiện tại được chấp nhận công khai.

## Statement

Cross-module read không tự do hoàn toàn. `Dashboard`, `Jira` và `Translation` chỉ được đọc những phần dữ liệu đã được allowlist trong kiến trúc hiện tại.

## Protected assets

- write ownership của owner module
- tránh trượt từ read sang hidden write coupling
- khả năng audit ai đang phụ thuộc vào dữ liệu nào

## Allowed / forbidden

- `Dashboard`: đọc dữ liệu vận hành đa nguồn.
- `Jira`: đọc snapshot issue/revision/comment/attachment/translation/project/job cho dry-run và outbound.
- `Translation`: đọc context issue/project tối thiểu.
- Bị cấm: biến read exception thành write exception mặc định.

## Related Entities

- [MOD-010-dashboard](../../../01-structure/modules/MOD-010-dashboard/README.md) - consumer read model
- [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - consumer outbound snapshot
- [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - consumer context tối thiểu

## Evidence

- `docs/architecture/04-boundaries.md`
