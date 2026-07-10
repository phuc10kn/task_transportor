---
schema: entity-instance/v1
id: MB-003
slug: read-allowlist
title: Read Allowlist
entity_type: ModuleBoundary
layer: 05-architecture
concern: 02-boundaries
status: active
summary: Boundary này chốt các ngoại lệ đọc chéo module hiện tại được chấp nhận công khai.
theory_basis:
  - TH-MOD-05
  - TH-MOD-06
relations:
  constrains:
    - MOD-010
    - MOD-007
    - MOD-003
---
# MB-003 - Read Allowlist

## Summary

Boundary này chốt các ngoại lệ đọc chéo module hiện tại được chấp nhận công khai.

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

- Canonical relation: [MOD-010-dashboard](../../../01-structure/modules/MOD-010-dashboard/README.md) - consumer read model
- Canonical relation: [MOD-007-jira](../../../01-structure/modules/MOD-007-jira/README.md) - consumer outbound snapshot
- Canonical relation: [MOD-003-translation](../../../01-structure/modules/MOD-003-translation/README.md) - consumer context tối thiểu



## Why this boundary matters

Boundary này chốt các ngoại lệ đọc chéo module hiện tại được chấp nhận công khai. Boundary này giữ owner, access hoặc write discipline không bị mơ hồ khi code thay đổi.

## Architectural consequences

Module chịu boundary này phải giữ public API, owner-write discipline và các read/write exception đã được nêu trong Statement.

## Relations

Frontmatter ghi các fact canonical đã được evidence xác nhận. Reverse trace được derive; `Related Entities` chỉ là context hoặc evidence khi không có relation tương ứng.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
